/* eslint-disable */
// The following activities can exist on every NoW
// ["access-roads", "camps", "blasting_operation", "exploration_surface_drilling", "mechanical_trenching", "settling_pond", "water_supply"]
// below outlines what activities are present on specific Now Types
export const activityConditions = {
  QCA: ["sand-and-gravel"],
  SAG: ["sand-and-gravel"],
  QIM: ["sand-and-gravel"],
  COL: ["surface-bulk-sample", "cut-lines-polarization-survey", "underground-exploration"],
  MIN: ["surface-bulk-sample", "cut-lines-polarization-survey", "underground-exploration"],
  PLA: ["placer-operation", "cut-lines-polarization-survey", "underground-exploration"],
};

export const activitiesMenu = [
  { href: "application-info", title: "Application Info", alwaysVisible: true },
  { href: "contacts", title: "Contacts", alwaysVisible: true },
  { href: "securities", title: "Securities", alwaysVisible: true },
  { href: "access", title: "Access", alwaysVisible: true },
  { href: "state-of-land", title: "State of Land", alwaysVisible: true },
  { href: "first-aid", title: "First Aid", alwaysVisible: true },
  { href: "reclamation", title: "Summary of Reclamation", alwaysVisible: true },
  {
    href: "exploration-access",
    title: "Access Roads, Trails, Helipads, Air Strips, Boat Ramps",
    alwaysVisible: true,
  },
  { href: "blasting-operation", title: "Blasting", alwaysVisible: true },
  {
    href: "camps",
    title: "Camps, Buildings, Staging Areas, Fuel/Lubricant Storage",
    alwaysVisible: true,
  },
  {
    href: "cut-lines-polarization-survey",
    title: "Cut Lines and Induced Polarization Survey",
    alwaysVisible: false,
  },
  {
    href: "exploration-surface-drilling",
    title: "Exploration Surface Drilling",
    alwaysVisible: true,
  },
  { href: "mechanical-trenching", title: "Mechanical Trenching / Test Pits", alwaysVisible: true },
  { href: "settling-pond", title: "Settling Ponds", alwaysVisible: true },
  { href: "surface-bulk-sample", title: "Surface Bulk Sample", alwaysVisible: false },
  { href: "underground-exploration", title: "Underground Exploration", alwaysVisible: false },
  { href: "sand-and-gravel", title: "Sand and Gravel / Quarry Operations", alwaysVisible: false },
  { href: "placer-operation", title: "Placer Operations", alwaysVisible: false },
  { href: "water-supply", title: "Water Supply", alwaysVisible: true },
  { href: "submission-documents", title: "Submission Documents", alwaysVisible: true },
  { href: "additional-documents", title: "Additional Documents", alwaysVisible: true },
];

export const renderActivities = (type, activity) => {
  return activityConditions[type].includes(activity);
};
