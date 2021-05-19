/* eslint-disable */
// The following activities can exist on every NoW
// ["access-roads", "camp", "blasting_operation", "exploration_surface_drilling", "mechanical_trenching", "settling_pond", "water_supply"]
// below outlines what activities are present on specific Now Types
export const activityConditions = {
  QCA: ["sand-and-gravel"],
  SAG: ["sand-and-gravel"],
  QIM: ["sand-and-gravel"],
  COL: ["surface-bulk-sample", "cut-lines-polarization-survey", "underground-exploration"],
  MIN: ["surface-bulk-sample", "cut-lines-polarization-survey", "underground-exploration"],
  PLA: ["placer-operation", "cut-lines-polarization-survey", "underground-exploration"],
};

export const permitWithoutConditions = {
  "draft-permit": ["permit-document"],
  administrative: [""],
};

export const permitWithConditions = {
  "draft-permit": ["conditions"],
  administrative: ["generated-documents"],
};
export const renderActivities = (type, activity) => {
  return activityConditions[type].includes(activity);
};

// TODO
export const renderNavOptions = (hasConditions, tabSection, href) => {
  // console.log(hasConditions, tabSection, href);
  const tab = tabSection === "draft-permit" || tabSection === "administrative";
  return true;
  // only run this logic for the draft and administrative tab
  // return hasConditions && tab ? permitWithConditions[tabSection].includes(href) : permitWithoutConditions[tabSection].includes(href);
};

export const sideMenuOptions = {
  application: [
    {
      href: "application-info",
      title: "Application Info",
      alwaysVisible: true,
      applicationType: ["NOW", "ADA"],
    },
    { href: "contacts", title: "Contacts", alwaysVisible: true, applicationType: ["NOW", "ADA"] },
    { href: "access", title: "Access", alwaysVisible: true, applicationType: ["NOW"] },
    {
      href: "state-of-land",
      title: "State of Land",
      alwaysVisible: true,
      applicationType: ["NOW"],
    },
    { href: "first-aid", title: "First Aid", alwaysVisible: true, applicationType: ["NOW"] },
    {
      href: "reclamation",
      title: "Summary of Reclamation",
      alwaysVisible: true,
      applicationType: ["NOW"],
    },
    {
      href: "exploration-access",
      title: "Access Roads, Trails, Helipads, Air Strips, Boat Ramps",
      alwaysVisible: true,
      applicationType: ["NOW"],
    },
    {
      href: "blasting-operation",
      title: "Blasting",
      alwaysVisible: true,
      applicationType: ["NOW"],
    },
    {
      href: "camp",
      title: "Camps, Buildings, Staging Areas, Fuel/Lubricant Storage",
      alwaysVisible: true,
      applicationType: ["NOW"],
    },
    {
      href: "cut-lines-polarization-survey",
      title: "Cut Lines and Induced Polarization Survey",
      alwaysVisible: false,
      applicationType: ["NOW"],
    },
    {
      href: "exploration-surface-drilling",
      title: "Exploration Surface Drilling",
      alwaysVisible: true,
      applicationType: ["NOW"],
    },
    {
      href: "mechanical-trenching",
      title: "Mechanical Trenching / Test Pits",
      alwaysVisible: true,
      applicationType: ["NOW"],
    },
    {
      href: "settling-pond",
      title: "Settling Ponds",
      alwaysVisible: true,
      applicationType: ["NOW"],
    },
    {
      href: "surface-bulk-sample",
      title: "Surface Bulk Sample",
      alwaysVisible: false,
      applicationType: ["NOW"],
    },
    {
      href: "underground-exploration",
      title: "Underground Exploration",
      alwaysVisible: false,
      applicationType: ["NOW"],
    },
    {
      href: "sand-and-gravel",
      title: "Sand and Gravel / Quarry Operations",
      alwaysVisible: false,
      applicationType: ["NOW"],
    },
    {
      href: "placer-operation",
      title: "Placer Operations",
      alwaysVisible: false,
      applicationType: ["NOW"],
    },
    { href: "water-supply", title: "Water Supply", alwaysVisible: true, applicationType: ["NOW"] },
    {
      href: "application-files",
      title: "Application Files",
      alwaysVisible: true,
      applicationType: ["NOW"],
    },
    {
      href: "additional-application-files",
      title: "Additional Application Files",
      alwaysVisible: true,
      applicationType: ["NOW", "ADA"],
    },
  ],
  "draft-permit": [
    {
      href: "general-info",
      title: "General Information",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "authorization",
      title: "Permit Authorizations",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "site-properties",
      title: "Site Properties",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "preamble",
      title: "Preamble",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "conditions",
      title: "Conditions",
      alwaysVisible: false,
      children: [
        { href: "GEC", title: "General" },
        { href: "HSC", title: "Health and Safety" },
        { href: "GOC", title: "Geotechnical" },
        { href: "ELC", title: "Environmental Land" },
        { href: "RCC", title: "Reclamation and Closure" },
      ],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "permit-document",
      title: "Permit Document Upload",
      alwaysVisible: false,
      children: [],
      applicationType: ["ADA"],
    },
    {
      href: "maps",
      title: "Maps",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
  ],
  referral: [
    {
      href: "referral",
      title: "Referral",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
  ],
  consultation: [
    {
      href: "consultation",
      title: "Consultation",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
  ],
  "public-comment": [
    {
      href: "advertisements",
      title: "Advertisements",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW"],
    },
    {
      href: "public-comment",
      title: "Public Comment",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW"],
    },
  ],
  administrative: [
    {
      href: "final-application-package",
      title: "Final Application Package",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "reclamation-securities",
      title: "Reclamation Securities",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "government-documents",
      title: "Government Documents",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "generated-documents",
      title: "Application Export Files",
      alwaysVisible: false,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "inspectors",
      title: "Inspectors",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
    },
    {
      href: "progress-tracking",
      title: "Application Progress Tracking",
      alwaysVisible: true,
      children: [],
      applicationType: ["NOW", "ADA"],
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
  REV: `This page is for reviewing and editing the information and documents sent in with an Application. All information provided by the proponent, and any additional files requested during the application review live here. When the Technical Review is in progress, use the "Edit" button to update information about this application.`,
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
  PRO: "This page allows you to review the progress of the application and record decisions.",
  ADMIN:
    "This page contains information about securities, inspectors, progress tracking, and any internal files relevant to processing the application.",
};

export const APPLICATION_PROGRESS_TRACKING = {
  NOW: ["REV", "REF", "CON", "PUB", "DFT"],
  ADA: ["REF", "CON", "DFT"],
};
