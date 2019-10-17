const MINERAL_EX = "Mineral";
const PLACER_OP = "Placer Operations";
const COAL_EX = "Coal";
const QUARRY_IND = "Quarry - Industrial Mineral";
const QUARRY_AGG = "Quarry - Construction Aggregate";
const SAND_GRAVEL = "Sand & Gravel";

// Activities are rendered based on NoW type: there are 3 categories activities fall into, outlined below:
export const isMineralOrPlacerOrCoal = (type) =>
  type === MINERAL_EX || type === PLACER_OP || type === COAL_EX;
export const isMineralOrCoal = (type) => type === MINERAL_EX || type === COAL_EX;
export const isPlacer = (type) => type === PLACER_OP;
export const isSandAndGravelOrQuarry = (type) =>
  type === QUARRY_IND || type === SAND_GRAVEL || type === QUARRY_AGG;

const MULTI_YR_PERMIT = "I would like to apply for a Multi-Year permit";
const MULTI_YR_AREA_PERMIT = "I would like to apply for a Multi-Year, Area Based permit";
export const isMultiYearPermit = (type) =>
  type === MULTI_YR_PERMIT || type === MULTI_YR_AREA_PERMIT;

export const isConditionTrue = (condition) => condition === "Yes";
