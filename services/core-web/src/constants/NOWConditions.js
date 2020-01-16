const MINERAL_EX = "MIN";
const PLACER_OP = "PLA";
const COAL_EX = "COL";
const QUARRY_IND = "QIM";
const QUARRY_AGG = "QCA";
const SAND_GRAVEL = "SAG";
export const isMineralOrPlacerOrCoal = (type) =>
  type === MINERAL_EX || type === PLACER_OP || type === COAL_EX;
export const isMineralOrCoal = (type) => type === MINERAL_EX || type === COAL_EX;
export const isPlacer = (type) => type === PLACER_OP;
export const isSandAndGravelOrQuarry = (type) =>
  type === QUARRY_IND || type === SAND_GRAVEL || type === QUARRY_AGG;
