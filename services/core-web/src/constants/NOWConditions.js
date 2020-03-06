/* eslint-disable */
// The following activities can exist on every NoW
// ["access-roads", "camps", "blasting_operation", "exploration_surface_drilling", "mechanical_trenching", "settling_pond", "water_supply"]
// below outlines what activities are present on specific Now Types
export const activityConditions = {
  QCA: ["sand-and-gravel"],
  SAG: ["sand-and-gravel"],
  QIM: ["sand-and-gravel"],
  COL: ["surface_bulk_sample", "cut-lines-polarization-survey", "underground_exploration"],
  MIN: ["surface_bulk_sample", "cut-lines-polarization-survey", "underground_exploration"],
  PLA: ["placer_operation", "cut-lines-polarization-survey", "underground_exploration"],
};

export const activitiesMenu = [
  { href: "application-info", title: "Application Info" },
  { href: "contacts", title: "Contacts" },
  { href: "access", title: "Access" },
  { href: "state-of-land", title: "State of Land" },
  { href: "first-aid", title: "First Aid" },
  { href: "reclamation", title: "Summary of Reclamation" },
  {
    href: "exploration-access",
    title: "Access Roads, Trails, Helipads, Air Strips, Boat Ramps",
  },
  { href: "blasting-operation", title: "Blasting" },
  { href: "camps", title: "Camps, Buildings, Staging Areas, Fuel/Lubricant Storage" },
  {
    href: "cut-lines-polarization-survey",
    title: "Cut Lines and Induced Polarization Survey",
  },
  { href: "exploration-surface-drilling", title: "Exploration Surface Drilling" },
  { href: "mechanical-trenching", title: "Mechanical Trenching / Test Pits" },
  { href: "settling-pond", title: "Settling Ponds" },
  { href: "surface-bulk-sample", title: "Surface Bulk Sample" },
  { href: "underground-exploration", title: "Underground Exploration" },
  { href: "sand-and-gravel", title: "Sand and Gravel / Quarry Operations" },
  { href: "placer-operation", title: "Placer Operations" },
  { href: "water-supply", title: "Water Supply" },
  { href: "submission-documents", title: "Submission Documents" },
  { href: "additional-documents", title: "Additional Documents" },
];

export const renderActivities = (type, activity) => {
  return activityConditions[type].includes(activity);
};
