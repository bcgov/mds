import { PropTypes, shape } from "prop-types";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const nowApplication = shape({
  application_guid: PropTypes.string.isRequired,
  mine_guid: PropTypes.string,
  mine_name: PropTypes.string,
  minenumber: PropTypes.string,
  trackingnumber: PropTypes.number,
  applicationtype: PropTypes.string,
  status: PropTypes.string,
  submitteddate: PropTypes.string,
  receiveddate: PropTypes.string,
  applicantclientid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  submitterclientid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  noticeofworktype: PropTypes.string,
  typeofpermit: PropTypes.string,
  typeofapplication: PropTypes.string,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
  nameofproperty: PropTypes.string,
  tenurenumbers: PropTypes.string,
  crowngrantlotnumbers: PropTypes.string,
  sitedirections: PropTypes.string,
  firstaidequipmentonsite: PropTypes.string,
  firstaidcertlevel: PropTypes.string,
  descexplorationprogram: PropTypes.string,
  proposedstartdate: PropTypes.string,
  proposedenddate: PropTypes.string,
  yearroundseasonal: PropTypes.string,
  landcommunitywatershed: PropTypes.string,
  landprivate: PropTypes.string,
  landlegaldesc: PropTypes.string,
  archsitesaffected: PropTypes.string,
  sandgravelquarryoperations: PropTypes.string,
  storeexplosivesonsite: PropTypes.string,
  bcexplosivespermitissued: PropTypes.string,
  bcexplosivespermitnumber: PropTypes.string,
  bcexplosivespermitexpiry: PropTypes.string,
  campdisturbedarea: PropTypes.number,
  camptimbervolume: PropTypes.string,
  bldgdisturbedarea: PropTypes.number,
  bldgtimbervolume: PropTypes.string,
  stgedisturbedarea: PropTypes.number,
  stgetimbervolume: PropTypes.string,
  fuellubstoreonsite: PropTypes.string,
  fuellubstored: PropTypes.number,
  fuellubstoremethodbulk: PropTypes.string,
  fuellubstoremethodbarrel: PropTypes.string,
  cbsfreclamation: PropTypes.string,
  cbsfreclamationcost: PropTypes.number,
  mechtrenchingreclamation: PropTypes.string,
  mechtrenchingreclamationcost: PropTypes.number,
  expsurfacedrillreclamation: PropTypes.string,
  expsurfacedrillreclcorestorage: PropTypes.string,
  expsurfacedrillreclamationcost: PropTypes.number,
  expaccessreclamation: PropTypes.string,
  expaccessreclamationcost: PropTypes.number,
  surfacebulksampleprocmethods: PropTypes.string,
  surfacebulksamplereclamation: PropTypes.string,
  surfacebulksamplereclsephandl: PropTypes.string,
  surfacebulksamplerecldrainmiti: PropTypes.string,
  surfacebulksamplereclcost: PropTypes.number,
  underexptotalore: PropTypes.string,
  underexptotaloreunits: PropTypes.string,
  underexptotalwaste: PropTypes.string,
  underexptotalwasteunits: PropTypes.string,
  underexpreclamation: PropTypes.string,
  underexpreclamationcost: PropTypes.number,
  placerundergroundoperations: PropTypes.string,
  placerhandoperations: PropTypes.string,
  placerreclamationarea: PropTypes.number,
  placerreclamation: PropTypes.string,
  placerreclamationcost: PropTypes.number,
  sandgrvqrydepthoverburden: PropTypes.string,
  sandgrvqrydepthtopsoil: PropTypes.string,
  sandgrvqrystabilizemeasures: PropTypes.string,
  sandgrvqrywithinaglandres: PropTypes.string,
  sandgrvqryalrpermitnumber: PropTypes.string,
  sandgrvqrylocalgovsoilrembylaw: PropTypes.string,
  sandgrvqryofficialcommplan: PropTypes.string,
  sandgrvqrylandusezoning: PropTypes.string,
  sandgrvqryendlanduse: PropTypes.string,
  sandgrvqrytotalmineres: PropTypes.string,
  sandgrvqrytotalmineresunits: PropTypes.string,
  sandgrvqryannualextrest: PropTypes.string,
  sandgrvqryannualextrestunits: PropTypes.string,
  sandgrvqryreclamation: PropTypes.string,
  sandgrvqryreclamationbackfill: PropTypes.string,
  sandgrvqryreclamationcost: PropTypes.number,
  sandgrvqrygrdwtravgdepth: PropTypes.string,
  sandgrvqrygrdwtrexistingareas: PropTypes.number,
  sandgrvqrygrdwtrtestpits: PropTypes.string,
  sandgrvqrygrdwtrtestwells: PropTypes.string,
  sandgrvqrygrdwtrother: PropTypes.string,
  sandgrvqrygrdwtrmeasprotect: PropTypes.string,
  sandgrvqryimpactdistres: PropTypes.string,
  sandgrvqryimpactdistwater: PropTypes.string,
  sandgrvqryimpactnoise: PropTypes.string,
  sandgrvqryimpactprvtaccess: PropTypes.string,
  sandgrvqryimpactprevtdust: PropTypes.string,
  sandgrvqryimpactminvisual: PropTypes.string,
  cutlinesexplgridtotallinekms: PropTypes.string,
  cutlinesexplgridtimbervolume: PropTypes.string,
  cutlinesreclamation: PropTypes.string,
  cutlinesreclamationcost: PropTypes.number,
  pondswastewatertreatfacility: PropTypes.string,
  freeusepermit: PropTypes.string,
  licencetocut: PropTypes.string,
  timbertotalvolume: PropTypes.string,
  campbuildstgetotaldistarea: PropTypes.number,
  mechtrenchingtotaldistarea: PropTypes.number,
  expsurfacedrilltotaldistarea: PropTypes.number,
  expaccesstotaldistarea: PropTypes.number,
  surfacebulksampletotaldistarea: PropTypes.number,
  placertotaldistarea: PropTypes.number,
  underexptotaldistarea: PropTypes.number,
  sandgrvqrytotaldistarea: PropTypes.number,
  pondstotaldistarea: PropTypes.number,
  reclcostsubtotal: PropTypes.number,
  reclcostexist: PropTypes.string,
  reclcostrecl: PropTypes.number,
  reclcosttotal: PropTypes.number,
  reclareasubtotal: PropTypes.number,
  reclareaexist: PropTypes.string,
  reclarearecl: PropTypes.number,
  reclareatotal: PropTypes.number,
  anyotherinformation: PropTypes.string,
  vfcbcapplicationurl: PropTypes.string,
  messagecreateddate: PropTypes.string,
  processed: PropTypes.string,
  processeddate: PropTypes.string,
  cutlinesexplgriddisturbedarea: PropTypes.number,
  pondsrecycled: PropTypes.string,
  pondsexfiltratedtoground: PropTypes.string,
  pondsdischargedtoenv: PropTypes.string,
  pondsreclamation: PropTypes.string,
  pondsreclamationcost: PropTypes.string,
  sandgrvqrytotalexistdistarea: PropTypes.number,
  nrsosapplicationid: PropTypes.string,
  isblastselect: PropTypes.string,
  istimberselect: PropTypes.string,
  applicant: PropTypes.objectOf(PropTypes.any),
  submitter: PropTypes.objectOf(PropTypes.any),
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  existing_placer_activity: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  existing_settling_pond: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  proposed_placer_activity: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  proposed_settling_pond: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  surface_bulk_sample_activity: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  sand_grv_qry_activity: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  under_exp_new_activity: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  under_exp_rehab_activity: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  under_exp_surface_activity: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  water_source_activity: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  exp_surface_drill_activity: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
});

export const importedNOWApplication = shape({
  now_application_id: PropTypes.number,
  now_application_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  now_message_id: PropTypes.number,
  now_tracking_number: PropTypes.number,
  notice_of_work_type_code: PropTypes.string,
  submitted_date: PropTypes.string,
  received_date: PropTypes.string,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
  property_name: PropTypes.string,
  tenure_number: PropTypes.string,
  description_of_land: PropTypes.string,
  proposed_start_date: PropTypes.string,
  proposed_end_date: PropTypes.string,

  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  blasting: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  state_of_land: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  camps: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  cut_lines_polarization_survey: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  exploration_access: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  exploration_surface_drilling: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  mechanical_trenching: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  sand_and_gravel: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  settling_pond: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  surface_bulk_sample: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  underground_exploration: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  water_supply: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
});
