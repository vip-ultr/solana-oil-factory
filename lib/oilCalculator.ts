export interface OilData {
  oilUnits: number;
  barrels: number;
  remainder: number;
  fillPercentages: number[];
  crude: number;
  title: string;
  /** Bonus CRUDE earned from Bags platform fees */
  bonusCrude?: number;
  /** Total CRUDE = crude + bonusCrude */
  totalCrude?: number;
}

const BARREL_SIZE = 50;
const CRUDE_RATE = 10;
const MAX_BARRELS = 10;

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

export function calculateOilData(txCount: number): OilData {
  const oilUnits = txCount;
  const barrels = Math.floor(oilUnits / BARREL_SIZE);
  const remainder = oilUnits % BARREL_SIZE;
  const crude = Math.floor(oilUnits / CRUDE_RATE);
  const title = getPrestigeTitle(crude);

  // Build fill percentages array (capped at MAX_BARRELS)
  // Partial barrel always comes FIRST, full barrels follow
  const fillPercentages: number[] = [];
  const displayBarrels = Math.min(barrels, MAX_BARRELS);

  // Add partial barrel first if there's a remainder and we haven't hit the cap
  if (remainder > 0 && displayBarrels < MAX_BARRELS) {
    fillPercentages.push(Math.round((remainder / BARREL_SIZE) * 100));
  }

  for (let i = 0; i < displayBarrels; i++) {
    fillPercentages.push(100);
  }

  return { oilUnits, barrels, remainder, fillPercentages, crude, title };
}
