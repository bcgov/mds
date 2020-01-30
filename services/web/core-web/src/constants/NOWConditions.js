/* eslint-disable */
// The following activities can exist on every NoW
// ["access-roads", "camps", "blasting_operation", "exploration_surface_drilling", "mechanical_trenching", "settling_pond", "water_supply"]
// below outlines what activities are present on specific Now Types
export const activityConditions = {
  QCA: ["sand_and_gravel"],
  SAG: ["sand_and_gravel"],
  QIM: ["sand_and_gravel"],
  COL: ["surface_bulk_sample", "cut_lines_polarization_survey", "underground_exploration"],
  MIN: ["surface_bulk_sample", "cut_lines_polarization_survey", "underground_exploration"],
  PLA: ["placer_operation", "cut_lines_polarization_survey", "underground_exploration"],
};
