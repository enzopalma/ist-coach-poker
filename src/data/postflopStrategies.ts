export interface HandClassPostflopAction {
  category: string;
  examples: string;
  comboSharePct: number;
  checkPct: number;
  betSmallPct: number; // 33% pot
  betBigPct: number;   // 66-75% pot
  overbetPct: number;  // 125% pot
  explanation: string;
}

export interface StreetPlan {
  street: "FLOP" | "TURN" | "RIVER";
  title: string;
  globalFrequencies: {
    check: number;
    bet33: number;
    bet75: number;
    overbet125: number;
  };
  preferredSizing: string;
  rangeAdvantage: "HERO_STRONG" | "HERO_SLIGHT" | "NEUTRAL" | "VILLAIN_SLIGHT";
  nutAdvantage: "HERO" | "NEUTRAL" | "VILLAIN";
  strategicSummary: string;
  handCategories: HandClassPostflopAction[];
  turnRiverRunouts?: {
    cardType: string;
    exampleCards: string;
    strategyAdjustment: string;
    recommendedSizing: string;
  }[];
}

export interface PostflopSpotStrategy {
  id: string;
  spotName: string;
  positions: string;
  potType: "SRP_IP" | "SRP_OOP" | "3BET_IP" | "3BET_OOP";
  boardCards: { rank: string; suit: "s" | "h" | "d" | "c" }[];
  boardLabel: string;
  textureTag: string;
  spr: number;
  potSizeBb: number;
  heroRole: string;
  pt4LeakWarning: string;
  streets: {
    FLOP: StreetPlan;
    TURN: StreetPlan;
    RIVER: StreetPlan;
  };
}

export const POSTFLOP_STRATEGIES: PostflopSpotStrategy[] = [
  {
    id: "BTN_VS_BB_SRP_AK7R",
    spotName: "BTN vs BB (Single Raised Pot IP)",
    positions: "BTN (Hero IP) vs BB (Villain OOP)",
    potType: "SRP_IP",
    boardCards: [
      { rank: "A", suit: "s" },
      { rank: "K", suit: "d" },
      { rank: "7", suit: "c" },
    ],
    boardLabel: "A♠ K♦ 7♣",
    textureTag: "Seco Broadway / Ventaja de Rango y Nuts",
    spr: 13.2,
    potSizeBb: 5.5,
    heroRole: "Agresor Preflop En Posición (IP)",
    pt4LeakWarning:
      "En PT4, muchos jugadores hacen Check con pares medios (QQ-88) o apuestan 66% perdiendo fold equity barata. Aquí el Range C-Bet a 33% bote es casi del 100%.",
    streets: {
      FLOP: {
        street: "FLOP",
        title: "Flop C-Bet IP en Board A-K-7 Rainbow",
        globalFrequencies: {
          check: 6,
          bet33: 82,
          bet75: 12,
          overbet125: 0,
        },
        preferredSizing: "Bet 33% Pot (1.8 bb)",
        rangeAdvantage: "HERO_STRONG",
        nutAdvantage: "HERO",
        strategicSummary:
          "BTN tiene todos los AA, KK, AK, AQ, AJs que la BB 3-betea preflop. Al tener ventaja masiva tanto de rango como de nuts en una textura seca sin proyectos de color, la estrategia óptima simplificada es apostar el 33% del bote con prácticamente todo nuestro rango (Range Bet).",
        handCategories: [
          {
            category: "Nuts & Dos Pares+ (AA, KK, 77, AK, A7s, K7s)",
            examples: "AA, KK, 77, AKo, AKs, A7s",
            comboSharePct: 11,
            checkPct: 0,
            betSmallPct: 80,
            betBigPct: 20,
            overbetPct: 0,
            explanation: "Construimos el bote desde el flop mezclando 33% con todo el rango para no revelar fuerza, preparando Overbet en el Turn."
          },
          {
            category: "Top Pair (AQ, AJ, AT, A9s-A2s)",
            examples: "AQo, AJs, ATs, A5s, A2s",
            comboSharePct: 22,
            checkPct: 4,
            betSmallPct: 86,
            betBigPct: 10,
            overbetPct: 0,
            explanation: "Apuesta 33% por valor directo y protección; obliga a la BB a defender con segunda pareja, pocket pairs y gutshots."
          },
          {
            category: "Second Pair & Pocket Pairs (QQ-88, KQ, KJ, KT)",
            examples: "QQ, JJ, TT, KQs, KJo, KTs",
            comboSharePct: 24,
            checkPct: 12,
            betSmallPct: 88,
            betBigPct: 0,
            overbetPct: 0,
            explanation: "Con 33% negamos la equidad de manos con una overcard o gutshot de la BB y mantenemos el control de la mano IP."
          },
          {
            category: "Gutshots & Backdoors (QJs, QTs, JTs, 98s, 86s)",
            examples: "QJs, JTs, QTs, 98s, 65s",
            comboSharePct: 25,
            checkPct: 5,
            betSmallPct: 80,
            betBigPct: 15,
            overbetPct: 0,
            explanation: "Excelentes candidatos para C-betear 33% y continuar haciendo 2nd Barrel (Overbet) en el Turn cuando ganan equidad."
          },
          {
            category: "Aire Total / Pares Bajos (66-22, 54s, 97s)",
            examples: "55, 44, 22, 54s, 85s",
            comboSharePct: 18,
            checkPct: 8,
            betSmallPct: 92,
            betBigPct: 0,
            overbetPct: 0,
            explanation: "Se benefician enormemente del fold inmediato de la BB (que debe foldear >42% ante apenas 1/3 del bote)."
          }
        ]
      },
      TURN: {
        street: "TURN",
        title: "Turn 2nd Barrel tras Flop Bet 33% y Call de BB",
        globalFrequencies: {
          check: 48,
          bet33: 5,
          bet75: 17,
          overbet125: 30,
        },
        preferredSizing: "Overbet 125% Pot o Bet 75%",
        rangeAdvantage: "HERO_STRONG",
        nutAdvantage: "HERO",
        strategicSummary:
          "Cuando la BB paga en el flop, su rango queda condensado en Ax débiles, Kx, pares medios y gutshots (QJ, JT, QT). En el Turn polarizamos nuestro rango: hacemos Check Back con las manos de valor medio (Ax bajos, KQ/KJ, QQ-88) y usamos un tamaño grande (75% a 125% Overbet) con AQ+, dobles parejas, sets y nuestros mejores proyectos.",
        handCategories: [
          {
            category: "Valor Fuerte (AA, KK, 77, AK, A7s, AQ)",
            examples: "AA, KK, 77, AK, AQs, AQo",
            comboSharePct: 18,
            checkPct: 5,
            betSmallPct: 0,
            betBigPct: 25,
            overbetPct: 70,
            explanation: "Máxima presión con Overbet 125% para poder ir all-in geométricamente en el River contra cualquier Ax del rival."
          },
          {
            category: "Top Pair Medio/Débil (AJ, AT, A8s-A2s)",
            examples: "AJo, ATs, A8s, A4s",
            comboSharePct: 20,
            checkPct: 65,
            betSmallPct: 10,
            betBigPct: 20,
            overbetPct: 5,
            explanation: "Muchos Ax débiles hacen Check Back en Turn para cobrar valor seguro en el River o atrapar bluffs de la BB."
          },
          {
            category: "Showdown Value (KQ, KJ, QQ-88, 7x)",
            examples: "KQs, KJo, QQ, TT, 87s",
            comboSharePct: 28,
            checkPct: 95,
            betSmallPct: 5,
            betBigPct: 0,
            overbetPct: 0,
            explanation: "Puro Check Back en Turn: ya cumplimos nuestro objetivo en el Flop y queremos llegar a Showdown barato."
          },
          {
            category: "Semifaroles Fuertes (QJs, JTs, Turn Flush Draws)",
            examples: "QJs, QTs, JTs, 98s con FD",
            comboSharePct: 20,
            checkPct: 20,
            betSmallPct: 0,
            betBigPct: 30,
            overbetPct: 50,
            explanation: "Balancean las Overbets de valor y tienen outs limpios a la escalera nut (Broadway) si la BB paga."
          },
          {
            category: "Aire Sin Equidad (54s, 65s sin FD, 44-22)",
            examples: "44, 33, 22, 65o",
            comboSharePct: 14,
            checkPct: 85,
            betSmallPct: 0,
            betBigPct: 10,
            overbetPct: 5,
            explanation: "Nos rendimos (Check Back) con las manos sin equidad ni bloqueadores relevantes."
          }
        ],
        turnRiverRunouts: [
          {
            cardType: "Carta Blanca Baja (2♥, 3♠, 4♦)",
            exampleCards: "2♥, 3♠, 4♦",
            strategyAdjustment: "Mantiene intacta la ventaja de nuts de BTN. Usa Overbet 125% con alta frecuencia (AQ+, sets, gutshots broadway).",
            recommendedSizing: "Overbet 125%"
          },
          {
            cardType: "Broadway que completa Escalera (Q, J, T)",
            exampleCards: "Q♠, J♦, T♣",
            strategyAdjustment: "Reduce la frecuencia de Overbet y usa 75% pot; ahora algunas manos de dos pares y escaleras entran en ambos rangos.",
            recommendedSizing: "Bet 75%"
          },
          {
            cardType: "Se dobla el As o el Rey (A♣, K♥)",
            exampleCards: "A♣, K♥",
            strategyAdjustment: "Usa tamaño pequeño (33%) o grande polarizado: el rival tiene muy pocos Ax/Kx fuertes comparado con BTN.",
            recommendedSizing: "Bet 33% / 100%"
          }
        ]
      },
      RIVER: {
        street: "RIVER",
        title: "River Plan: Triple Barrel vs Check Back",
        globalFrequencies: {
          check: 42,
          bet33: 8,
          bet75: 25,
          overbet125: 25,
        },
        preferredSizing: "Bet 75% - All-In Polarizado",
        rangeAdvantage: "HERO_STRONG",
        nutAdvantage: "HERO",
        strategicSummary:
          "En el River, tras haber apostado Flop y Turn, tu rango está completamente polarizado entre manos que vencen a un Top Pair bueno (AK, sets, escaleras completadas) y proyectos fallidos. Usa bloqueadores de AK/AQ (como QJ, QT, JT fallidos) para ejecutar el 3er barrel.",
        handCategories: [
          {
            category: "Nuts, Sets y Dos Pares (AA, KK, 77, AK, escaleras)",
            examples: "AA, KK, 77, AK, QJ completado",
            comboSharePct: 38,
            checkPct: 0,
            betSmallPct: 0,
            betBigPct: 35,
            overbetPct: 65,
            explanation: "Apuesta grande o All-in por valor; la BB está obligada a pagar con sus mejores Ax para no ser explotada."
          },
          {
            category: "Top Pair Fuerte (AQ, AJ)",
            examples: "AQs, AQo, AJs",
            comboSharePct: 24,
            checkPct: 35,
            betSmallPct: 20,
            betBigPct: 45,
            overbetPct: 0,
            explanation: "Value bet de 66-75% en rivers blancos; si tras hacer Check en Turn la BB hace Check en River, apuesta 66% siempre."
          },
          {
            category: "Bluffs con Bloqueadores (QJo, QTs, JTs fallidos)",
            examples: "QJs, QTs, JTs (sin completar)",
            comboSharePct: 22,
            checkPct: 25,
            betSmallPct: 0,
            betBigPct: 35,
            overbetPct: 40,
            explanation: "Bloquean AQ, AJ, KQ y escaleras; excelentes para forzar el fold de Ax débiles y Kx en el River."
          },
          {
            category: "Showdown Medio (AT, A9, KQ tras Check Turn)",
            examples: "ATs, A9s, KQs",
            comboSharePct: 16,
            checkPct: 80,
            betSmallPct: 20,
            betBigPct: 0,
            overbetPct: 0,
            explanation: "Si hiciste Check en Turn y la BB apuesta en River, paga con tus Ax y haz Check Back cuando te pasen con Kx."
          }
        ]
      }
    }
  },
  {
    id: "BTN_VS_BB_SRP_JT8S",
    spotName: "BTN vs BB (Board Dinámico Conectado)",
    positions: "BTN (Hero IP) vs BB (Villain OOP)",
    potType: "SRP_IP",
    boardCards: [
      { rank: "J", suit: "s" },
      { rank: "T", suit: "s" },
      { rank: "8", suit: "d" },
    ],
    boardLabel: "J♠ T♠ 8♦",
    textureTag: "Dinámico / Conectado con Proyecto de Color",
    spr: 13.2,
    potSizeBb: 5.5,
    heroRole: "Agresor Preflop IP en Board Coordindado",
    pt4LeakWarning:
      "Error grave frecuente en PT4: hacer C-Bet de 33% automático con todo el rango en J-T-8. La BB tiene todas las escaleras (Q9, 97, 76) y dobles parejas (JT, J8, T8), y te hará Check-Raise masivamente.",
    streets: {
      FLOP: {
        street: "FLOP",
        title: "Flop C-Bet Selectivo y Grande en J♠ T♠ 8♦",
        globalFrequencies: {
          check: 54,
          bet33: 8,
          bet75: 38,
          overbet125: 0,
        },
        preferredSizing: "Bet 66% - 75% Pot (o Check)",
        rangeAdvantage: "NEUTRAL",
        nutAdvantage: "NEUTRAL",
        strategicSummary:
          "En boards medios ultra-conectados (J-T-8 con flush draw), las equidades corren muy cercanas y la BB conecta fuertemente. Debes bajar tu frecuencia de C-Bet a ~46% y aumentar el tamaño a 66%-75% para cobrar a proyectos y proteger tus manos fuertes.",
        handCategories: [
          {
            category: "Escaleras, Sets y Dos Pares (Q9s, 97s, JJ, TT, 88, JTs)",
            examples: "Q9s, 97s, JJ, TT, 88, JTs",
            comboSharePct: 12,
            checkPct: 10,
            betSmallPct: 5,
            betBigPct: 85,
            overbetPct: 0,
            explanation: "Apuesta fuerte (75% bote) de inmediato: el board es muy peligroso y muchas cartas en el Turn cortan la acción o te superan."
          },
          {
            category: "Overpairs (AA, KK, QQ)",
            examples: "AA, KK, QQ",
            comboSharePct: 8,
            checkPct: 35,
            betSmallPct: 10,
            betBigPct: 55,
            overbetPct: 0,
            explanation: "QQ es el mejor Overpair para apostar porque bloquea Q9; AA y KK sin pica deben mezclar Check para proteger tu rango de Check."
          },
          {
            category: "Top Pair (AJ, KJ, QJ, J9s)",
            examples: "AJs, KJs, QJo, J9s",
            comboSharePct: 18,
            checkPct: 50,
            betSmallPct: 10,
            betBigPct: 40,
            overbetPct: 0,
            explanation: "Apuesta más con AJ/KJ y haz Check con Jx débiles para no aislarte contra manos mejores si recibes un Check-Raise."
          },
          {
            category: "Combo Draws, Flush Draws y OESD (AsXs, KQs, A9s, 98s)",
            examples: "A♠5♠, K♠Q♠, KQo, 98s",
            comboSharePct: 28,
            checkPct: 35,
            betSmallPct: 5,
            betBigPct: 60,
            overbetPct: 0,
            explanation: "Tus proyectos de color nut y KQ (OESD + overcards) presionan con 75%, mientras que proyectos medios hacen Check para realizar equidad gratis."
          },
          {
            category: "Pares Medios/Bajos y Aire (77-22, A2o-A7o, K5s sin FD)",
            examples: "66, 55, A6o, K4s (sin pica)",
            comboSharePct: 34,
            checkPct: 92,
            betSmallPct: 0,
            betBigPct: 8,
            overbetPct: 0,
            explanation: "Disciplina total: haz Check Back. Apostar con aire sin equidad en J-T-8 quema bb/100 contra el alto Check-Raise de la BB."
          }
        ]
      },
      TURN: {
        street: "TURN",
        title: "Turn en Board J-T-8: Evaluando Cambios de Textura",
        globalFrequencies: {
          check: 45,
          bet33: 10,
          bet75: 40,
          overbet125: 5,
        },
        preferredSizing: "Bet 75% Pot",
        rangeAdvantage: "HERO_SLIGHT",
        nutAdvantage: "NEUTRAL",
        strategicSummary:
          "En el Turn la textura cambia drásticamente según la cuarta carta: si cae una carta que completa color (♠) o deja 4-straight en mesa (Q, 9, 7), ralentiza con dos pares/sets y apuesta tus colores/escaleras altas.",
        handCategories: [
          {
            category: "Escaleras Altas y Colores (Q9, K9 en Turn J, Flush ♠)",
            examples: "Q9s, A♠K♠, A♠5♠",
            comboSharePct: 24,
            checkPct: 5,
            betSmallPct: 10,
            betBigPct: 75,
            overbetPct: 10,
            explanation: "Continúa construyendo el bote con 75% para dejar un SPR < 1 en el River."
          },
          {
            category: "Sets y Dos Pares (JJ, TT, 88, JTs)",
            examples: "JJ, TT, 88, JTs",
            comboSharePct: 22,
            checkPct: 25,
            betSmallPct: 15,
            betBigPct: 60,
            overbetPct: 0,
            explanation: "En turns blancos sigue apostando 75% a tope; si se completa el color o 4-straight, baja el sizing o haz Check para buscar full house."
          },
          {
            category: "Overpairs y Top Pair (AA-QQ, AJ)",
            examples: "AA, KK, AJs",
            comboSharePct: 26,
            checkPct: 70,
            betSmallPct: 10,
            betBigPct: 20,
            overbetPct: 0,
            explanation: "Excelentes manos para controlar el bote en el Turn y pagar en el River o cobrar valor fino si la BB pasa dos veces."
          },
          {
            category: "Proyectos de Escalera + Bloqueadores (KQo, A♠X)",
            examples: "KQo con ♠, A♠K♦",
            comboSharePct: 28,
            checkPct: 50,
            betSmallPct: 5,
            betBigPct: 45,
            overbetPct: 0,
            explanation: "Tener el A♠ o K♠ te permite seguir apostando en turns de pica representando el color nut."
          }
        ],
        turnRiverRunouts: [
          {
            cardType: "Se completa el Color (2♠, 6♠, A♠)",
            exampleCards: "2♠, 6♠, A♠",
            strategyAdjustment: "Chequea tus Overpairs y dos pares sin pica; apuesta con tus colores y usa manos con el A♠ como farol.",
            recommendedSizing: "Bet 66% o Check"
          },
          {
            cardType: "Carta Blanca Desconectada (2♣, 3♥)",
            exampleCards: "2♣, 3♥",
            strategyAdjustment: "Tus sets, escaleras y mejores overpairs siguen apostando 75% por valor y protección máxima.",
            recommendedSizing: "Bet 75%"
          }
        ]
      },
      RIVER: {
        street: "RIVER",
        title: "River en Board Coordinado: Bloqueadores de Nuts",
        globalFrequencies: {
          check: 52,
          bet33: 12,
          bet75: 36,
          overbet125: 0,
        },
        preferredSizing: "Bet 75% Pot",
        rangeAdvantage: "NEUTRAL",
        nutAdvantage: "NEUTRAL",
        strategicSummary:
          "En boards muy coordinados en el River, la selección de faroles depende exclusivamente de tener bloqueadores clave de la escalera o del color (por ejemplo, tener una Reina para bloquear Q9 o el A♠ en boards con 3 picas).",
        handCategories: [
          {
            category: "Escaleras Nut, Colores y Full Houses",
            examples: "Q9s, KQs (en 9), JJ en board doblado",
            comboSharePct: 35,
            checkPct: 0,
            betSmallPct: 5,
            betBigPct: 95,
            overbetPct: 0,
            explanation: "Apuesta fuerte por valor (75% - 100%)."
          },
          {
            category: "Dos Pares y Sets (cuando no se completan 4-cartas)",
            examples: "JTs, 88",
            comboSharePct: 25,
            checkPct: 35,
            betSmallPct: 35,
            betBigPct: 30,
            overbetPct: 0,
            explanation: "Usa un block/value bet de 33%-66% contra la BB para que te paguen Top Pairs."
          },
          {
            category: "Faroles con Bloqueador Clave (Qxo, A♠Xo)",
            examples: "AQo con A♠, KQo fallido",
            comboSharePct: 40,
            checkPct: 55,
            betSmallPct: 0,
            betBigPct: 45,
            overbetPct: 0,
            explanation: "Farolea solo cuando bloqueas la escalera (Q) o el color (A♠); ríndete con proyectos bajos fallidos (76, 65) que bloquean el rango de fold del rival."
          }
        ]
      }
    }
  },
  {
    id: "BTN_VS_CO_3BET_Q84",
    spotName: "3-Bet Pot IP (BTN vs CO)",
    positions: "BTN (Hero 3-Bettor IP) vs CO (Caller OOP)",
    potType: "3BET_IP",
    boardCards: [
      { rank: "Q", suit: "h" },
      { rank: "8", suit: "h" },
      { rank: "4", suit: "s" },
    ],
    boardLabel: "Q♥ 8♥ 4♠",
    textureTag: "3-Bet Pot / SPR Bajo / Reina Alta con Flush Draw",
    spr: 4.1,
    potSizeBb: 16.5,
    heroRole: "3-Bettor En Posición (SPR ~4.1)",
    pt4LeakWarning:
      "En botes 3-beteados con SPR ~4, apostar 75% en el flop es innecesario: una apuesta pequeña (30-33% del bote) ya prepara el stack para meter todo el dinero en Turn y River.",
    streets: {
      FLOP: {
        street: "FLOP",
        title: "Flop C-Bet en 3-Bet Pot IP (Q♥ 8♥ 4♠)",
        globalFrequencies: {
          check: 18,
          bet33: 72,
          bet75: 10,
          overbet125: 0,
        },
        preferredSizing: "Bet 33% Pot (5.4 bb)",
        rangeAdvantage: "HERO_STRONG",
        nutAdvantage: "HERO",
        strategicSummary:
          "En un 3-Bet Pot IP (BTN vs CO), el CO suele 4-betear AA/KK/AK, mientras que tú conservas todos los AA, KK, QQ, AQ y KQ. Con un SPR de ~4, apostar 33% del bote (5.4bb en 16.5bb) pone una presión tremenda sobre los pocket pairs (JJ-99) y AJs/ATs del CO.",
        handCategories: [
          {
            category: "Overpairs y Sets (AA, KK, QQ, 88)",
            examples: "AA, KK, QQ, 88",
            comboSharePct: 16,
            checkPct: 5,
            betSmallPct: 80,
            betBigPct: 15,
            overbetPct: 0,
            explanation: "Apuesta 33% para mantener dentro a todos los pares medios (JJ-99) y manos con backdoors del CO."
          },
          {
            category: "Top Pair (AQ, KQ, QJs, QTs)",
            examples: "AQs, AQo, KQs, QJs",
            comboSharePct: 24,
            checkPct: 8,
            betSmallPct: 82,
            betBigPct: 10,
            overbetPct: 0,
            explanation: "Con SPR 4, Top Pair con buen kicker es una mano de stack-off cómodo en 3 calles empezando con 33%."
          },
          {
            category: "Pares Medios Bajo la Q (JJ, TT, 99)",
            examples: "JJ, TT, 99",
            comboSharePct: 18,
            checkPct: 45,
            betSmallPct: 55,
            betBigPct: 0,
            overbetPct: 0,
            explanation: "Mezcla Check Back para proteger tu rango de Check y Bet 33% con las combinaciones que tienen un corazón (♥) para negar equidad a AK/AJ."
          },
          {
            category: "Flush Draws y Backdoor Nut FD (A♥K♥, A♥J♥, A♠K♥)",
            examples: "A♥J♥, A♥5♥, AKo con A♥",
            comboSharePct: 26,
            checkPct: 10,
            betSmallPct: 80,
            betBigPct: 10,
            overbetPct: 0,
            explanation: "Presión constante a bajo costo con inmensa equidad si el CO paga o hace Check-Raise."
          },
          {
            category: "Overcards sin Backdoor (AK/AJ sin ♥)",
            examples: "AKo (sin ♥), AJo (sin ♥)",
            comboSharePct: 16,
            checkPct: 35,
            betSmallPct: 65,
            betBigPct: 0,
            overbetPct: 0,
            explanation: "Apuesta 33% con alta frecuencia pero sé selectivo en el Turn si no mejoras."
          }
        ]
      },
      TURN: {
        street: "TURN",
        title: "Turn en 3-Bet Pot: Preparando el Shove de River",
        globalFrequencies: {
          check: 46,
          bet33: 12,
          bet75: 42,
          overbet125: 0,
        },
        preferredSizing: "Bet 55% - 66% Pot",
        rangeAdvantage: "HERO_STRONG",
        nutAdvantage: "HERO",
        strategicSummary:
          "Tras apostar 5.4bb en Flop y recibir Call, el bote en Turn es de ~27.3bb y quedan ~86bb detrás (SPR ~3.1). Una apuesta de ~55%-66% del bote (16-18bb) deja exactamente un All-in de tamaño < 1 bote en el River.",
        handCategories: [
          {
            category: "Valor de Stack-Off (AA, KK, QQ, AQ, KQ)",
            examples: "AA, KK, QQ, AQs, KQs",
            comboSharePct: 36,
            checkPct: 10,
            betSmallPct: 15,
            betBigPct: 75,
            overbetPct: 0,
            explanation: "Apuesta ~60% del bote para ir all-in en cualquier River limpio."
          },
          {
            category: "Proyectos de Color y Combo Draws (♥)",
            examples: "A♥J♥, K♥J♥, A♥5♥",
            comboSharePct: 24,
            checkPct: 15,
            betSmallPct: 15,
            betBigPct: 70,
            overbetPct: 0,
            explanation: "Tus mejores semifaroles ponen en una situación imposible a JJ-99 y QJs del rival."
          },
          {
            category: "Showdown Medio (JJ-99, QTs)",
            examples: "JJ, TT, QTs",
            comboSharePct: 40,
            checkPct: 90,
            betSmallPct: 10,
            betBigPct: 0,
            overbetPct: 0,
            explanation: "Haz Check Back en Turn para realizar tu equidad gratis y pagar una apuesta razonable en el River."
          }
        ]
      },
      RIVER: {
        street: "RIVER",
        title: "River All-In Geométrico en 3-Bet Pot",
        globalFrequencies: {
          check: 48,
          bet33: 0,
          bet75: 52,
          overbet125: 0,
        },
        preferredSizing: "All-In (~68% - 80% Pot)",
        rangeAdvantage: "HERO_STRONG",
        nutAdvantage: "HERO",
        strategicSummary:
          "Con el SPR restante en el River (< 0.8x el bote), tu único tamaño después de 2 barrels es el All-In con tus manos de valor (AQ+, sets) y tus proyectos fallidos con bloqueadores de color/top pair.",
        handCategories: [
          {
            category: "Valor All-In (AA, KK, QQ, 88, AQ)",
            examples: "AA, KK, QQ, AQs, AQo",
            comboSharePct: 62,
            checkPct: 5,
            betSmallPct: 0,
            betBigPct: 95,
            overbetPct: 0,
            explanation: "Shove directo por valor; el rival no puede foldear sus Qx después de pagar dos calles."
          },
          {
            category: "Bluff All-In con Bloqueadores (A♥K, A♥J fallidos)",
            examples: "A♥K♠, A♥J♠ (cuando no cae el 3er ♥)",
            comboSharePct: 38,
            checkPct: 35,
            betSmallPct: 0,
            betBigPct: 65,
            overbetPct: 0,
            explanation: "Bloquean AA y AQ del rival, maximizando la probabilidad de que tenga KJs/QJs/JJ y tenga que foldear."
          }
        ]
      }
    }
  },
  {
    id: "SB_VS_BB_SRP_963R",
    spotName: "SB vs BB (Guerra de Ciegas OOP)",
    positions: "SB (Hero OOP) vs BB (Villain IP)",
    potType: "SRP_OOP",
    boardCards: [
      { rank: "9", suit: "s" },
      { rank: "6", suit: "d" },
      { rank: "3", suit: "c" },
    ],
    boardLabel: "9♠ 6♦ 3♣",
    textureTag: "Guerra de Ciegas OOP / Board Bajo Desconectado",
    spr: 15.8,
    potSizeBb: 6.0,
    heroRole: "Agresor Preflop Fuera de Posición (OOP)",
    pt4LeakWarning:
      "En SB vs BB, muchos jugadores hacen C-Bet del 75% de las veces en boards bajos y luego hacen Check-Fold en el Turn. Estando OOP con rangos amplios, debes chequear ~55% en el Flop y proteger tu rango de Check.",
    streets: {
      FLOP: {
        street: "FLOP",
        title: "Flop C-Bet OOP en BvB (9♠ 6♦ 3♣)",
        globalFrequencies: {
          check: 52,
          bet33: 15,
          bet75: 33,
          overbet125: 0,
        },
        preferredSizing: "Check / Bet 66% Pot",
        rangeAdvantage: "HERO_SLIGHT",
        nutAdvantage: "NEUTRAL",
        strategicSummary:
          "En SB vs BB, al estar fuera de posición (OOP) en un board 9-6-3, la BB tiene posición y todos los sets/dos pares bajos. No podemos hacer Range Bet de 33%; en su lugar, dividimos el rango protegiendo nuestro Check (con manos fuertes para hacer Check-Raise o Check-Call) y apostando 66% con manos que quieren valor y protección inmediata.",
        handCategories: [
          {
            category: "Overpairs Altos (AA, KK, QQ) y Sets (99, 66, 33)",
            examples: "AA, KK, 99, 66",
            comboSharePct: 10,
            checkPct: 40,
            betSmallPct: 10,
            betBigPct: 50,
            overbetPct: 0,
            explanation: "Es vital dejar ~40% de AA/KK/Sets en tu rango de Check para hacer Check-Raise contra el Float agresivo de la BB."
          },
          {
            category: "Overpairs Vulnerables (JJ, TT) y Top Pair (A9, K9, Q9)",
            examples: "JJ, TT, A9s, K9s, Q9s",
            comboSharePct: 18,
            checkPct: 25,
            betSmallPct: 20,
            betBigPct: 55,
            overbetPct: 0,
            explanation: "JJ, TT y Top Pair sufren mucho si dan carta gratis a dos overcards de la BB: prefieren apostar 66% para cobrar y negar equidad."
          },
          {
            category: "Second Pair (88, 77, A6s, 76s) y As-Alto (AK, AQ)",
            examples: "88, 77, A6s, AKo, AQo",
            comboSharePct: 28,
            checkPct: 75,
            betSmallPct: 15,
            betBigPct: 10,
            overbetPct: 0,
            explanation: "Pilar de tu rango de Check-Call: controla el bote OOP y atrapa los faroles automáticos de la BB cuando pasas."
          },
          {
            category: "Gutshots y Overcards con Backdoor (87s, 75s, 54s, KJo)",
            examples: "87s, 75s, 54s, QTs, JTs",
            comboSharePct: 44,
            checkPct: 55,
            betSmallPct: 15,
            betBigPct: 30,
            overbetPct: 0,
            explanation: "Apuesta 66% con tus mejores proyectos de escalera (87s, 54s, 75s) y haz Check-Fold con las manos completamente desconectadas."
          }
        ]
      },
      TURN: {
        street: "TURN",
        title: "Turn en Guerra de Ciegas OOP",
        globalFrequencies: {
          check: 48,
          bet33: 8,
          bet75: 34,
          overbet125: 10,
        },
        preferredSizing: "Bet 75% Pot o Check-Call",
        rangeAdvantage: "HERO_SLIGHT",
        nutAdvantage: "HERO",
        strategicSummary:
          "En el Turn, si apostaste 66% en el Flop y la BB pagó, sigue presionando fuerte (75% - 110%) en cartas altas (A, K, Q, J) que favorecen dramáticamente al rango preflop de la SB.",
        handCategories: [
          {
            category: "Overpairs, Sets y Top Pair Mejorado",
            examples: "AA-TT, 99, A9s",
            comboSharePct: 40,
            checkPct: 20,
            betSmallPct: 10,
            betBigPct: 55,
            overbetPct: 15,
            explanation: "Sigue cobrando valor contra los 9x, 6x y pocket pairs medios de la BB."
          },
          {
            category: "2nd Barrel en Cartas Altas (AK, AQ, KQ que ligan o tienen FD)",
            examples: "AKs, AQs, 87s",
            comboSharePct: 60,
            checkPct: 55,
            betSmallPct: 5,
            betBigPct: 30,
            overbetPct: 10,
            explanation: "Cuando cae una figura (K, Q, J) en el Turn, la SB gana mucha ventaja: úsala para disparar el segundo barril."
          }
        ]
      },
      RIVER: {
        street: "RIVER",
        title: "River OOP en Guerra de Ciegas",
        globalFrequencies: {
          check: 55,
          bet33: 10,
          bet75: 35,
          overbet125: 0,
        },
        preferredSizing: "Bet 75% Pot / Block 33%",
        rangeAdvantage: "NEUTRAL",
        nutAdvantage: "NEUTRAL",
        strategicSummary:
          "En el River OOP, incorpora un tamaño de Block Bet (33%) con tus Top Pairs medios (K9, Q9) para evitar enfrentar una apuesta grande de la BB y extraer valor de 6x/77/88.",
        handCategories: [
          {
            category: "Valor Fuerte (Sets, Dos Pares, AA-QQ)",
            examples: "99, 66, AA, KK",
            comboSharePct: 45,
            checkPct: 15,
            betSmallPct: 5,
            betBigPct: 80,
            overbetPct: 0,
            explanation: "Apuesta 75% por valor claro."
          },
          {
            category: "Top Pair Medio (K9, Q9, J9)",
            examples: "K9s, Q9s",
            comboSharePct: 30,
            checkPct: 40,
            betSmallPct: 50,
            betBigPct: 10,
            overbetPct: 0,
            explanation: "Usa Block Bet de 33% OOP para fijar tu propio precio al Showdown."
          },
          {
            category: "Proyectos Fallidos (87s, 75s, 54s)",
            examples: "87s, 54s",
            comboSharePct: 25,
            checkPct: 40,
            betSmallPct: 0,
            betBigPct: 60,
            overbetPct: 0,
            explanation: "Tus mejores faroles en el River porque tienen 8-alto o 7-alto sin valor de Showdown y no bloquean los folds de la BB."
          }
        ]
      }
    }
  }
];
