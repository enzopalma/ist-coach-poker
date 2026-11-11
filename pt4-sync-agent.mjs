/**
 * IST COACH - Agente Sincronizador de PokerTracker 4 a la Web
 * -----------------------------------------------------------
 * Como PokerTracker 4 guarda tus manos en el PostgreSQL de tu PC (localhost:5432)
 * y nuestra plataforma vive en la Web (en red), este script lee tu base de datos
 * local de PT4 y genera el archivo `mi_pt4_cloud.json` (o lo envía a la nube)
 * para cargarlo en 1 clic en la aplicación web.
 *
 * Uso:
 *   node pt4-sync-agent.mjs
 */

import pg from "pg";
import fs from "fs";

const { Client } = pg;

const config = {
  host: process.env.PT4_HOST || "localhost",
  port: Number(process.env.PT4_PORT || 5432),
  database: process.env.PT4_DB || "PT4 DB",
  user: process.env.PT4_USER || "postgres",
  password: process.env.PT4_PASSWORD || "dbpass",
};

function mapPt4Pos(pt4Pos) {
  switch (Number(pt4Pos)) {
    case 0: return "BTN";
    case 1: return "CO";
    case 2: return "MP";
    case 3:
    case 4:
    case 5: return "UTG";
    case 8: return "SB";
    case 9: return "BB";
    default: return null;
  }
}

async function syncPt4ToCloudFile() {
  console.log("🔄 Conectando con tu base de datos local de PokerTracker 4...");
  const client = new Client(config);

  try {
    await client.connect();
    const playerRes = await client.query(`
      SELECT p.id_player, p.player_name, COUNT(s.id_hand) AS hands
      FROM player p
      JOIN cash_hand_player_statistics s ON s.id_player = p.id_player
      GROUP BY p.id_player, p.player_name
      ORDER BY hands DESC
      LIMIT 1;
    `);

    if (playerRes.rows.length === 0) {
      console.error("⚠️ No se encontraron manos de Cash Games en esta base de datos de PT4.");
      await client.end();
      process.exit(1);
    }

    const hero = playerRes.rows[0];
    console.log(`✅ Jugador detectado: ${hero.player_name} (${hero.hands} manos)`);

    const statsRes = await client.query(
      `
      SELECT
        s.position AS pt4_pos,
        COUNT(s.id_hand) AS hands,
        SUM(CASE WHEN s.flg_vpip THEN 1 ELSE 0 END) AS vpip_cnt,
        SUM(CASE WHEN s.flg_pfr THEN 1 ELSE 0 END) AS pfr_cnt,
        SUM(CASE WHEN s.flg_pfr_open THEN 1 ELSE 0 END) AS rfi_cnt,
        SUM(CASE WHEN s.flg_p_3bet THEN 1 ELSE 0 END) AS threebet_cnt,
        SUM(CASE WHEN s.flg_p_3bet_opp THEN 1 ELSE 0 END) AS threebet_opp,
        SUM(CASE WHEN s.flg_p_ccall THEN 1 ELSE 0 END) AS ccall_cnt,
        SUM(CASE WHEN s.flg_f_cbet THEN 1 ELSE 0 END) AS cbet_f_cnt,
        SUM(CASE WHEN s.flg_f_cbet_opp THEN 1 ELSE 0 END) AS cbet_f_opp,
        SUM(s.amt_won) AS net_won,
        SUM(CASE WHEN l.amt_bb > 0 THEN (s.amt_won / l.amt_bb) ELSE 0 END) AS total_bb_won
      FROM cash_hand_player_statistics s
      LEFT JOIN cash_limit l ON s.id_limit = l.id_limit
      WHERE s.id_player = $1
      GROUP BY s.position;
      `,
      [hero.id_player]
    );

    await client.end();

    const pct = (n, d) => (d > 0 ? Number(((n / d) * 100).toFixed(1)) : 0);
    const positions = {};
    let totalHands = 0;
    let totalNetWon = 0;
    let totalBbWon = 0;

    for (const row of statsRes.rows) {
      const pos = mapPt4Pos(row.pt4_pos);
      if (!pos) continue;
      const h = Number(row.hands || 0);
      totalHands += h;
      totalNetWon += Number(row.net_won || 0);
      totalBbWon += Number(row.total_bb_won || 0);

      positions[pos] = {
        pos,
        hands: h,
        vpip: pct(Number(row.vpip_cnt), h),
        pfr: pct(Number(row.pfr_cnt), h),
        rfi: pct(Number(row.rfi_cnt), h),
        threeBet: pct(Number(row.threebet_cnt), Number(row.threebet_opp)),
        coldCall: pct(Number(row.ccall_cnt), h),
        cbetFlop: pct(Number(row.cbet_f_cnt), Number(row.cbet_f_opp)),
        bb100: h > 0 ? Number(((Number(row.total_bb_won) / h) * 100).toFixed(1)) : 0,
      };
    }

    const cloudPayload = {
      source: "PT4_SYNC_FILE",
      playerName: hero.player_name,
      databaseName: `PT4 Sincronizado (${hero.player_name})`,
      totalHands,
      netWonUsd: Number(totalNetWon.toFixed(2)),
      bb100: totalHands > 0 ? Number(((totalBbWon / totalHands) * 100).toFixed(2)) : 0,
      positions,
      syncedAt: new Date().toISOString(),
    };

    fs.writeFileSync("mi_pt4_cloud.json", JSON.stringify(cloudPayload, null, 2), "utf-8");
    console.log("🚀 ¡Listo! Archivo 'mi_pt4_cloud.json' generado. Súbelo en la Web App para ver tus estadísticas reales.");
  } catch (err) {
    console.error("❌ Error al conectar con PostgreSQL de PT4:", err.message);
  }
}

syncPt4ToCloudFile();
