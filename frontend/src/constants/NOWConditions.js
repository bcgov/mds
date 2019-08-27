const MINERAL_EX = "Mineral";
const PLACER_OP = "Placer Operations";
const COAL_EX = "Coal";
export const isMineralOrPlacerOrCoal = (type) =>
  type === MINERAL_EX || type === PLACER_OP || type === COAL_EX;

const MULTI_YR_PERMIT = "I would like to apply for a Multi-Year permit";
const MULTI_YR_AREA_PERMIT = "I would like to apply for a Multi-Year, Area Based permit";
export const isMultiYearPermit = (type) =>
  type === MULTI_YR_PERMIT || type === MULTI_YR_AREA_PERMIT;

export const isConditionTrue = (condition) => condition === "Yes";
