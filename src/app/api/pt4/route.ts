import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import { Position } from "@/data/pokerRanges";
import { PositionStats, Pt4DatabaseSummary } from "@/data/pt4Analytics";

// PT4 6-Max position mapping in cash_hand_player_statistics:
// 0 = BTN, 1 = CO, 2 = MP (HJ), 3 = UTG (LJ), 8 = SB, 9 = BB
function mapPt4Position(pt4Pos: number): Position | null {
  switch (pt4Pos) {
    case 0:
      return "BTN";
    case 1:
      return "CO";
    case 2:
      return "MP";
    case 3:
    case 4:
    case 5:
      return "UTG";
    case 8:
      return "SB";
    case 9:
      return "BB";
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  let client: Client | null = null;
  try {
    const body = await req.json();
    const {
      host = "localhost",
      port = 5432,
      database = "PT4 DB",
      user = "postgres",
      password = "dbpass",
      playerName = "",
      action = "fetch_stats",
    } = body;

    client = new Client({
      host,
      port: Number(port),
      database,
      user,
      password,
      connectionTimeoutMillis: 4500,
    });

    await client.connect();

    if (action === "list_players") {
      const playersRes = await client.query(`
        SELECT p.player_name, COUNT(s.id_hand) AS hands
        FROM player p
        JOIN cash_hand_player_statistics s ON s.id_player = p.id_player
        GROUP BY p.id_player, p.player_name
        ORDER BY hands DESC
        LIMIT 15;
      `);
      await client.end();
      return NextResponse.json({
        ok: true,
        players: playersRes.rows.map((r) => ({
          name: r.player_name,
          hands: Number(r.hands),
        })),
      });
    }

    // Find target player (either specified playerName or player with the most hands in PT4)
    let targetPlayerId: number | null = null;
    let resolvedPlayerName = playerName;

    if (playerName && playerName.trim().length > 0) {
      const pRes = await client.query(
        `SELECT id_player, player_name FROM player WHERE LOWER(player_name) = LOWER($1) LIMIT 1`,
        [playerName.trim()]
      );
      if (pRes.rows.length > 0) {
        targetPlayerId = Number(pRes.rows[0].id_player);
        resolvedPlayerName = pRes.rows[0].player_name;
      }
    }

    if (!targetPlayerId) {
      const topPlayerRes = await client.query(`
        SELECT p.id_player, p.player_name, COUNT(s.id_hand) AS hands
        FROM player p
        JOIN cash_hand_player_statistics s ON s.id_player = p.id_player
        GROUP BY p.id_player, p.player_name
        ORDER BY hands DESC
        LIMIT 1;
      `);
      if (topPlayerRes.rows.length === 0) {
        await client.end();
        return NextResponse.json(
          {
            ok: false,
            error:
              "La base de datos de PokerTracker 4 está conectada pero no contiene manos de Cash Games registradas.",
          },
          { status: 404 }
        );
      }
      targetPlayerId = Number(topPlayerRes.rows[0].id_player);
      resolvedPlayerName = topPlayerRes.rows[0].player_name;
    }

    // Query PT4 cash_hand_player_statistics grouped by position
    const statsQuery = `
      SELECT
        s.position AS pt4_pos,
        COUNT(s.id_hand) AS hands,
        SUM(CASE WHEN s.flg_vpip THEN 1 ELSE 0 END) AS vpip_cnt,
        SUM(CASE WHEN s.flg_pfr THEN 1 ELSE 0 END) AS pfr_cnt,
        SUM(CASE WHEN s.flg_pfr_open THEN 1 ELSE 0 END) AS rfi_cnt,
        SUM(CASE WHEN s.flg_p_3bet THEN 1 ELSE 0 END) AS threebet_cnt,
        SUM(CASE WHEN s.flg_p_3bet_opp THEN 1 ELSE 0 END) AS threebet_opp,
        SUM(CASE WHEN s.flg_p_3bet_def_opp THEN 1 ELSE 0 END) AS fold_3bet_opp,
        SUM(CASE WHEN s.enum_p_3bet_action = 'F' THEN 1 ELSE 0 END) AS fold_3bet_cnt,
        SUM(CASE WHEN s.flg_p_ccall THEN 1 ELSE 0 END) AS ccall_cnt,
        SUM(CASE WHEN s.flg_f_cbet THEN 1 ELSE 0 END) AS cbet_f_cnt,
        SUM(CASE WHEN s.flg_f_cbet_opp THEN 1 ELSE 0 END) AS cbet_f_opp,
        SUM(CASE WHEN s.flg_t_cbet THEN 1 ELSE 0 END) AS cbet_t_cnt,
        SUM(CASE WHEN s.flg_t_cbet_opp THEN 1 ELSE 0 END) AS cbet_t_opp,
        SUM(CASE WHEN s.flg_f_saw THEN 1 ELSE 0 END) AS saw_flop_cnt,
        SUM(CASE WHEN s.flg_showdown THEN 1 ELSE 0 END) AS wtsd_cnt,
        SUM(CASE WHEN s.flg_showdown AND s.flg_won_hand THEN 1 ELSE 0 END) AS wsd_cnt,
        SUM(CASE WHEN s.flg_f_saw AND s.flg_won_hand THEN 1 ELSE 0 END) AS wwsf_cnt,
        SUM(s.amt_won) AS net_won,
        SUM(CASE WHEN l.amt_bb > 0 THEN (s.amt_won / l.amt_bb) ELSE 0 END) AS total_bb_won,
        SUM(CASE WHEN l.amt_bb > 0 THEN ((s.amt_won + COALESCE(s.amt_allin_ev_diff, 0)) / l.amt_bb) ELSE 0 END) AS total_ev_bb_won
      FROM cash_hand_player_statistics s
      LEFT JOIN cash_limit l ON s.id_limit = l.id_limit
      WHERE s.id_player = $1
      GROUP BY s.position;
    `;

    const statsRes = await client.query(statsQuery, [targetPlayerId]);
    await client.end();

    const posBuckets: Record<
      Position,
      {
        hands: number;
        vpip_cnt: number;
        pfr_cnt: number;
        rfi_cnt: number;
        threebet_cnt: number;
        threebet_opp: number;
        fold_3bet_opp: number;
        fold_3bet_cnt: number;
        ccall_cnt: number;
        cbet_f_cnt: number;
        cbet_f_opp: number;
        cbet_t_cnt: number;
        cbet_t_opp: number;
        saw_flop_cnt: number;
        wtsd_cnt: number;
        wsd_cnt: number;
        wwsf_cnt: number;
        net_won: number;
        total_bb_won: number;
        total_ev_bb_won: number;
      }
    > = {
      UTG: {
        hands: 0, vpip_cnt: 0, pfr_cnt: 0, rfi_cnt: 0, threebet_cnt: 0, threebet_opp: 0,
        fold_3bet_opp: 0, fold_3bet_cnt: 0, ccall_cnt: 0, cbet_f_cnt: 0, cbet_f_opp: 0,
        cbet_t_cnt: 0, cbet_t_opp: 0, saw_flop_cnt: 0, wtsd_cnt: 0, wsd_cnt: 0, wwsf_cnt: 0,
        net_won: 0, total_bb_won: 0, total_ev_bb_won: 0
      },
      MP: {
        hands: 0, vpip_cnt: 0, pfr_cnt: 0, rfi_cnt: 0, threebet_cnt: 0, threebet_opp: 0,
        fold_3bet_opp: 0, fold_3bet_cnt: 0, ccall_cnt: 0, cbet_f_cnt: 0, cbet_f_opp: 0,
        cbet_t_cnt: 0, cbet_t_opp: 0, saw_flop_cnt: 0, wtsd_cnt: 0, wsd_cnt: 0, wwsf_cnt: 0,
        net_won: 0, total_bb_won: 0, total_ev_bb_won: 0
      },
      CO: {
        hands: 0, vpip_cnt: 0, pfr_cnt: 0, rfi_cnt: 0, threebet_cnt: 0, threebet_opp: 0,
        fold_3bet_opp: 0, fold_3bet_cnt: 0, ccall_cnt: 0, cbet_f_cnt: 0, cbet_f_opp: 0,
        cbet_t_cnt: 0, cbet_t_opp: 0, saw_flop_cnt: 0, wtsd_cnt: 0, wsd_cnt: 0, wwsf_cnt: 0,
        net_won: 0, total_bb_won: 0, total_ev_bb_won: 0
      },
      BTN: {
        hands: 0, vpip_cnt: 0, pfr_cnt: 0, rfi_cnt: 0, threebet_cnt: 0, threebet_opp: 0,
        fold_3bet_opp: 0, fold_3bet_cnt: 0, ccall_cnt: 0, cbet_f_cnt: 0, cbet_f_opp: 0,
        cbet_t_cnt: 0, cbet_t_opp: 0, saw_flop_cnt: 0, wtsd_cnt: 0, wsd_cnt: 0, wwsf_cnt: 0,
        net_won: 0, total_bb_won: 0, total_ev_bb_won: 0
      },
      SB: {
        hands: 0, vpip_cnt: 0, pfr_cnt: 0, rfi_cnt: 0, threebet_cnt: 0, threebet_opp: 0,
        fold_3bet_opp: 0, fold_3bet_cnt: 0, ccall_cnt: 0, cbet_f_cnt: 0, cbet_f_opp: 0,
        cbet_t_cnt: 0, cbet_t_opp: 0, saw_flop_cnt: 0, wtsd_cnt: 0, wsd_cnt: 0, wwsf_cnt: 0,
        net_won: 0, total_bb_won: 0, total_ev_bb_won: 0
      },
      BB: {
        hands: 0, vpip_cnt: 0, pfr_cnt: 0, rfi_cnt: 0, threebet_cnt: 0, threebet_opp: 0,
        fold_3bet_opp: 0, fold_3bet_cnt: 0, ccall_cnt: 0, cbet_f_cnt: 0, cbet_f_opp: 0,
        cbet_t_cnt: 0, cbet_t_opp: 0, saw_flop_cnt: 0, wtsd_cnt: 0, wsd_cnt: 0, wwsf_cnt: 0,
        net_won: 0, total_bb_won: 0, total_ev_bb_won: 0
      },
    };

    for (const row of statsRes.rows) {
      const mappedPos = mapPt4Position(Number(row.pt4_pos));
      if (!mappedPos) continue;
      const b = posBuckets[mappedPos];
      b.hands += Number(row.hands || 0);
      b.vpip_cnt += Number(row.vpip_cnt || 0);
      b.pfr_cnt += Number(row.pfr_cnt || 0);
      b.rfi_cnt += Number(row.rfi_cnt || 0);
      b.threebet_cnt += Number(row.threebet_cnt || 0);
      b.threebet_opp += Number(row.threebet_opp || 0);
      b.fold_3bet_opp += Number(row.fold_3bet_opp || 0);
      b.fold_3bet_cnt += Number(row.fold_3bet_cnt || 0);
      b.ccall_cnt += Number(row.ccall_cnt || 0);
      b.cbet_f_cnt += Number(row.cbet_f_cnt || 0);
      b.cbet_f_opp += Number(row.cbet_f_opp || 0);
      b.cbet_t_cnt += Number(row.cbet_t_cnt || 0);
      b.cbet_t_opp += Number(row.cbet_t_opp || 0);
      b.saw_flop_cnt += Number(row.saw_flop_cnt || 0);
      b.wtsd_cnt += Number(row.wtsd_cnt || 0);
      b.wsd_cnt += Number(row.wsd_cnt || 0);
      b.wwsf_cnt += Number(row.wwsf_cnt || 0);
      b.net_won += Number(row.net_won || 0);
      b.total_bb_won += Number(row.total_bb_won || 0);
      b.total_ev_bb_won += Number(row.total_ev_bb_won || 0);
    }

    const pct = (num: number, den: number) =>
      den > 0 ? Number(((num / den) * 100).toFixed(1)) : 0;

    const positionsResult = {} as Record<Position, PositionStats>;
    let totalHands = 0;
    let totalNetWon = 0;
    let totalBbWon = 0;
    let totalEvBbWon = 0;
    let gVpip = 0,
      gPfr = 0,
      g3bCnt = 0,
      g3bOpp = 0,
      gF3bCnt = 0,
      gF3bOpp = 0,
      gCbfCnt = 0,
      gCbfOpp = 0,
      gCbtCnt = 0,
      gCbtOpp = 0,
      gSawFlop = 0,
      gWtsd = 0,
      gWsd = 0,
      gWwsf = 0;

    (["UTG", "MP", "CO", "BTN", "SB", "BB"] as Position[]).forEach((pos) => {
      const b = posBuckets[pos];
      const h = Math.max(1, b.hands);
      totalHands += b.hands;
      totalNetWon += b.net_won;
      totalBbWon += b.total_bb_won;
      totalEvBbWon += b.total_ev_bb_won;
      gVpip += b.vpip_cnt;
      gPfr += b.pfr_cnt;
      g3bCnt += b.threebet_cnt;
      g3bOpp += b.threebet_opp;
      gF3bCnt += b.fold_3bet_cnt;
      gF3bOpp += b.fold_3bet_opp;
      gCbfCnt += b.cbet_f_cnt;
      gCbfOpp += b.cbet_f_opp;
      gCbtCnt += b.cbet_t_cnt;
      gCbtOpp += b.cbet_t_opp;
      gSawFlop += b.saw_flop_cnt;
      gWtsd += b.wtsd_cnt;
      gWsd += b.wsd_cnt;
      gWwsf += b.wwsf_cnt;

      positionsResult[pos] = {
        position: pos,
        hands: b.hands,
        vpip: pct(b.vpip_cnt, h),
        pfr: pct(b.pfr_cnt, h),
        rfi: pct(b.rfi_cnt, h),
        threeBet: pct(b.threebet_cnt, Math.max(1, b.threebet_opp)),
        foldTo3Bet: pct(b.fold_3bet_cnt, Math.max(1, b.fold_3bet_opp)),
        coldCall: pct(b.ccall_cnt, h),
        cbetFlop: pct(b.cbet_f_cnt, Math.max(1, b.cbet_f_opp)),
        cbetTurn: pct(b.cbet_t_cnt, Math.max(1, b.cbet_t_opp)),
        wtsd: pct(b.wtsd_cnt, Math.max(1, b.saw_flop_cnt)),
        wsd: pct(b.wsd_cnt, Math.max(1, b.wtsd_cnt)),
        wwsf: pct(b.wwsf_cnt, Math.max(1, b.saw_flop_cnt)),
        bb100: b.hands > 0 ? Number(((b.total_bb_won / b.hands) * 100).toFixed(1)) : 0,
        evBb100: b.hands > 0 ? Number(((b.total_ev_bb_won / b.hands) * 100).toFixed(1)) : 0,
      };
    });

    const summary: Pt4DatabaseSummary = {
      source: "POSTGRES_LIVE",
      playerName: resolvedPlayerName,
      databaseName: database,
      stakeLabel: "Cash Games PT4 Live",
      totalHands,
      netWonUsd: Number(totalNetWon.toFixed(2)),
      bb100: totalHands > 0 ? Number(((totalBbWon / totalHands) * 100).toFixed(2)) : 0,
      evBb100: totalHands > 0 ? Number(((totalEvBbWon / totalHands) * 100).toFixed(2)) : 0,
      globalVpip: pct(gVpip, totalHands),
      globalPfr: pct(gPfr, totalHands),
      global3Bet: pct(g3bCnt, g3bOpp),
      globalFoldTo3Bet: pct(gF3bCnt, gF3bOpp),
      globalCbetFlop: pct(gCbfCnt, gCbfOpp),
      globalCbetTurn: pct(gCbtCnt, gCbtOpp),
      globalWtsd: pct(gWtsd, gSawFlop),
      globalWsd: pct(gWsd, gWtsd),
      globalWwsf: pct(gWwsf, gSawFlop),
      positions: positionsResult,
    };

    return NextResponse.json({ ok: true, summary });
  } catch (err: unknown) {
    if (client) {
      try {
        await client.end();
      } catch {
        // ignore close error
      }
    }
    const message =
      err instanceof Error ? err.message : "Error desconocido al conectar con PostgreSQL";
    return NextResponse.json(
      {
        ok: false,
        error: `No se pudo conectar al PostgreSQL de PokerTracker 4: ${message}`,
      },
      { status: 500 }
    );
  }
}
