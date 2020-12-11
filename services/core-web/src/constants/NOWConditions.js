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

export const renderActivities = (type, activity) => {
  return activityConditions[type].includes(activity);
};

export const sideMenuOptions = {
  application: [
    { href: "application-info", title: "Application Info", alwaysVisible: true },
    { href: "contacts", title: "Contacts", alwaysVisible: true },
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
    {
      href: "mechanical-trenching",
      title: "Mechanical Trenching / Test Pits",
      alwaysVisible: true,
    },
    { href: "settling-pond", title: "Settling Ponds", alwaysVisible: true },
    { href: "surface-bulk-sample", title: "Surface Bulk Sample", alwaysVisible: false },
    { href: "underground-exploration", title: "Underground Exploration", alwaysVisible: false },
    { href: "sand-and-gravel", title: "Sand and Gravel / Quarry Operations", alwaysVisible: false },
    { href: "placer-operation", title: "Placer Operations", alwaysVisible: false },
    { href: "water-supply", title: "Water Supply", alwaysVisible: true },
    { href: "application-files", title: "Application Files", alwaysVisible: true },
    {
      href: "additional-application-files",
      title: "Additional Application Files",
      alwaysVisible: true,
    },
  ],
  "draft-permit": [
    { href: "general-info", title: "General Information", alwaysVisible: true, children: [] },
    { href: "preamble", title: "Preamble", alwaysVisible: true, children: [] },
    {
      href: "conditions",
      title: "Conditions",
      alwaysVisible: true,
      children: [
        { href: "GEC", title: "General" },
        { href: "HSC", title: "Healthy and Safety" },
        { href: "GOC", title: "Geotechnical" },
        { href: "ELC", title: "Environmental Land" },
        { href: "RCC", title: "Reclamation and Closure" },
        { href: "ADC", title: "Additional Conditions" },
      ],
    },
    { href: "maps", title: "Maps", alwaysVisible: true, children: [] },
  ],
  referral: [{ href: "referral", title: "Referral", alwaysVisible: true, children: [] }],
  consultation: [
    { href: "consultation", title: "Consultation", alwaysVisible: true, children: [] },
  ],
  "public-comment": [
    { href: "advertisements", title: "Advertisements", alwaysVisible: true, children: [] },
    { href: "public-comment", title: "Public Comment", alwaysVisible: true, children: [] },
  ],
  administrative: [
    {
      href: "final-application-package",
      title: "Final Application Package",
      alwaysVisible: true,
      children: [],
    },
    {
      href: "reclamation-securities",
      title: "Reclamation Securities",
      alwaysVisible: true,
      children: [],
    },
    {
      href: "government-documents",
      title: "Government Documents",
      alwaysVisible: true,
      children: [],
    },
    {
      href: "generated-documents",
      title: "Application Export Files",
      alwaysVisible: true,
      children: [],
    },
    {
      href: "inspectors",
      title: "Inspectors",
      alwaysVisible: true,
      children: [],
    },
    {
      href: "progress-tracking",
      title: "Application Progress Tracking",
      alwaysVisible: true,
      children: [],
    },
  ],
};

export const securityNotRequiredReasonOptions = [
  { value: "Administrative Amendment", label: "Administrative Amendment" },
  { value: "ALC Holds Bond", label: "ALC Holds Bond" },
  { value: "Bonding is a Permit Condition", label: "Bonding is a Permit Condition" },
  { value: "Sufficient Bond in Place", label: "Sufficient Bond in Place" },
];

export const CONSULTATION_REVIEW_CODE = "FNC";
export const CONSULTATION_TAB_CODE = "CON";
export const REFERRAL_CODE = "REF";
export const PUBLIC_COMMENT = "PUB";
export const ADVERTISEMENT = "ADV";
export const ADVERTISEMENT_DOC = "PCA";

export const TAB_DISCLAIMERS = {
  REV: `This page is for reviewing and editing the information and documents sent in with a Notice of Work. All information provided by the proponent, and any additional files requested during the application review live here. When the Technical Review is in progress, use the "Edit" button to update information about this application.`,
  REF: `This page allows you to identify and download the files that need to be included in the referral package.
  You may track progress on the E-Referrals website.
  When responses are receives you can upload them by clicking on "Add Referral"
  Finish this stage by clicking on "Complete Referral" when all responses have been received.
  If you need to make changes later, click "Resume Referral".`,
  CON: `his page allows you to identify and download the files that need to be included in the package for first nations consultations.
            You may track progress on the Consultation reports and tracking system (CRTS).
            When responses are received you can upload them by clicking on "Add Consultation".
            Finish this stage by clicking on "Complete Consultation" when all responses have been received. If you need to make changes later, click "Resume Consultation".`,
  PUB: `This page allows you to track responses from the public.
                          When responses are received you can upload them by clicking on "Add Public Comment" or "Add Advertisement".
            Finish this stage by clicking on "Complete Public Comment" when all responses have been received. If you need to make changes later, click "Resume Public Comment".`,
  DFT: `This page contains all the information that will appear in the permit when it is
  issued. The Conditions sections are pre-populated with conditions based on the
  permit type. You can add, edit or remove any condition.`,
  PRO:
    "This page allows you to review the progress of the Notice of Work application and record decisions.",
  ADMIN:
    "This page contains information about securities, inspectors, progress tracking, and any internal files relevant to processing the application.",
};
