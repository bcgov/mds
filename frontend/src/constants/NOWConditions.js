const MINERAL_EX = "Mineral";
const PLACER_OP = "Placer Operations";
export const isMineralOrPlacer = (type) => type === MINERAL_EX || type === PLACER_OP;

const MULTI_YR_PERMIT = "I would like to apply for a Multi-Year permit";
const MULTI_YR_AREA_PERMIT = "I would like to apply for a Multi-Year, Area Based permit";
export const isMultiYearPermit = (type) =>
  type === MULTI_YR_PERMIT || type === MULTI_YR_AREA_PERMIT;
