export interface OilData {
  oilUnits: number;
  barrels: number;
  remainder: number;
  fillPercentages: number[];
  crude: number;
  title: string;
}

const BARREL_SIZE = 50;
const CRUDE_RATE = 10;
const MAX_BARRELS = 10;

export function getPrestigeTitle(crude: number): string {
  if (crude >= 1000) return "Oil Tycoon";
  if (crude >= 200) return "Refinery Boss";
  if (crude >= 50) return "Oil Producer";
  if (crude >= 5) return "Backyard Driller";
  return "Dry Well";
}

export function calculateOilData(txCount: number): OilData {
  const oilUnits = txCount;
  const barrels = Math.floor(oilUnits / BARREL_SIZE);
  const remainder = oilUnits % BARREL_SIZE;
  const crude = Math.floor(oilUnits / CRUDE_RATE);
  const title = getPrestigeTitle(crude);

  // Build fill percentages array (capped at MAX_BARRELS)
  const fillPercentages: number[] = [];
  const displayBarrels = Math.min(barrels, MAX_BARRELS);

  for (let i = 0; i < displayBarrels; i++) {
    fillPercentages.push(100);
  }

  // Add partial barrel if there's a remainder and we haven't hit the cap
  if (remainder > 0 && fillPercentages.length < MAX_BARRELS) {
    fillPercentages.push(Math.round((remainder / BARREL_SIZE) * 100));
  }

  return { oilUnits, barrels, remainder, fillPercentages, crude, title };
}
