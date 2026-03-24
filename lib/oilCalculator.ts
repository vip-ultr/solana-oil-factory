export interface OilData {
  oilUnits: number;
  barrels: number;
  remainder: number;
  fillPercentages: number[];
  crude: number;
  title: string;
  /** $CRUDE earned from the Bags Refinery (fee positions) */
  bagsCrude?: number;
  /** Total CRUDE = Solana crude + Bags crude */
  totalCrude?: number;
}

const BARREL_SIZE = 50;
const CRUDE_RATE = 10;
const MAX_BARRELS = 10;
const SHOWCASE_BARRELS = 5;
const CRUDE_CAP = 15000;

export function getPrestigeTitle(crude: number): string {
  if (crude >= 5000000) return "Supreme PetroLord";
  if (crude >= 1000000) return "Oil Tycoon";
  if (crude >= 500000) return "Crude Sovereign";
  if (crude >= 250000) return "Energy Overlord";
  if (crude >= 100000) return "Industrial Titan";
  if (crude >= 50000) return "Black Gold Emperor";
  if (crude >= 20000) return "Petrostate Architect";
  if (crude >= 10000) return "Global Refiner";
  if (crude >= 8000) return "Oil Syndicate Leader";
  if (crude >= 5000) return "Petroleum Magnate";
  if (crude >= 3500) return "Crude Commander";
  if (crude >= 2000) return "Oil Baron";
  if (crude >= 1200) return "Pipeline Baron";
  if (crude >= 800) return "Refinery Boss";
  if (crude >= 500) return "Black Gold Miner";
  if (crude >= 350) return "Refinery Engineer";
  if (crude >= 200) return "Pipeline Operator";
  if (crude >= 120) return "Rig Supervisor";
  if (crude >= 80) return "Field Driller";
  if (crude >= 50) return "Oil Producer";
  if (crude >= 20) return "Pump Jack Runner";
  if (crude >= 10) return "Small Rig Operator";
  if (crude >= 5) return "Backyard Driller";
  if (crude >= 1) return "Mud Digger";
  return "Dry Well";
}

/** Simple seeded RNG (LCG) — deterministic per wallet so fills don't change on reload */
function makeSeededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function calculateOilData(txCount: number): OilData {
  const oilUnits = txCount;
  const barrels = Math.floor(oilUnits / BARREL_SIZE);
  const remainder = oilUnits % BARREL_SIZE;
  const crude = Math.min(Math.floor(oilUnits / CRUDE_RATE), CRUDE_CAP);
  const title = getPrestigeTitle(crude);

  // Build fill percentages array
  const fillPercentages: number[] = [];

  if (barrels > 9) {
    // Show SHOWCASE_BARRELS partial fills first to demonstrate the gauge,
    // then up to MAX_BARRELS full barrels — total display cap = SHOWCASE_BARRELS + MAX_BARRELS
    const displayCount = Math.min(barrels, SHOWCASE_BARRELS + MAX_BARRELS);
    const rand = makeSeededRandom(oilUnits);
    for (let i = 0; i < SHOWCASE_BARRELS; i++) {
      fillPercentages.push(Math.round(15 + rand() * 75)); // 15–90%
    }
    for (let i = SHOWCASE_BARRELS; i < displayCount; i++) {
      fillPercentages.push(100);
    }
  } else {
    // Normal path: partial barrel first, then full barrels
    const displayBarrels = Math.min(barrels, MAX_BARRELS);
    if (remainder > 0 && displayBarrels < MAX_BARRELS) {
      fillPercentages.push(Math.round((remainder / BARREL_SIZE) * 100));
    }
    for (let i = 0; i < displayBarrels; i++) {
      fillPercentages.push(100);
    }
  }

  return { oilUnits, barrels, remainder, fillPercentages, crude, title };
}
