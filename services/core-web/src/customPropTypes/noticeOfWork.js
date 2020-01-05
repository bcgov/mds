import { PropTypes, shape } from "prop-types";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const nowApplication = shape({
  application_guid: PropTypes.string.isRequired,
  mine_guid: PropTypes.string,
  mine_name: PropTypes.string,
  minenumber: PropTypes.string,
  lead_inspector_party_guid: PropTypes.string,
  lead_inspector: PropTypes.objectOf(PropTypes.any),
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

export const activityDetails = shape({
  activity_type_description: PropTypes.string,
  disturbed_area: PropTypes.number,
  timber_volume: PropTypes.number,
  number_of_sites: PropTypes.number,
  width: PropTypes.number,
  length: PropTypes.number,
  depth: PropTypes.number,
  height: PropTypes.number,
  quantity: PropTypes.number,
  incline: PropTypes.number,
  incline_unit_type_code: PropTypes.string,
  cut_line_length: PropTypes.number,
  water_quantity: PropTypes.number,
  water_quantity_unit_type_code: PropTypes.string,
});

export const activityEquipment = shape({
  description: PropTypes.string,
  quantity: PropTypes.number,
  capacity: PropTypes.string,
});

export const activitySummary = shape({
  reclamation_description: PropTypes.string,
  reclamation_cost: PropTypes.number,
  total_disturbed_area: PropTypes.number,
  total_disturbed_area_unit_type_code: PropTypes.string,
  equipment: activityEquipment,
});

export const defaultActivity = shape({
  details: activityDetails,
  ...activitySummary,
});

export const camps = shape({
  camp_name: PropTypes.string,
  camp_number_people: PropTypes.number,
  camp_number_structures: PropTypes.number,
  has_fuel_stored: PropTypes.boolean,
  has_fuel_stored_in_bulk: PropTypes.boolean,
  has_fuel_stored_in_barrels: PropTypes.boolean,
  ...defaultActivity,
});

const surfaceDrilling = shape({
  reclamation_core_storage: PropTypes.string,
  ...defaultActivity,
});

const placer = shape({
  is_underground: PropTypes.boolean,
  is_hand_operation: PropTypes.boolean,
  reclamation_area: PropTypes.number,
  reclamation_unit_type_code: PropTypes.string,
  ...defaultActivity,
});

export const sandGravelQuarry = shape({
  average_overburden_depth: PropTypes.number,
  average_top_soil_depth: PropTypes.number,
  stability_measures_description: PropTypes.string,
  is_agricultural_land_reserve: PropTypes.boolean,
  agri_lnd_rsrv_permit_application_number: PropTypes.string,
  has_local_soil_removal_bylaw: PropTypes.boolean,
  community_plan: PropTypes.string,
  land_use_zoning: PropTypes.string,
  proposed_land_use: PropTypes.string,
  total_mineable_reserves: PropTypes.number,
  total_mineable_reserves_unit_type_code: PropTypes.string,
  total_annual_extraction: PropTypes.number,
  total_annual_extraction_unit_type_code: PropTypes.string,
  average_groundwater_depth: PropTypes.number,
  has_groundwater_from_existing_area: PropTypes.boolean,
  has_groundwater_from_test_pits: PropTypes.boolean,
  has_groundwater_from_test_wells: PropTypes.boolean,
  groundwater_from_other_description: PropTypes.string,
  groundwater_protection_plan: PropTypes.string,
  nearest_residence_distance: PropTypes.number,
  nearest_residence_distance_unit_type_code: PropTypes.string,
  nearest_water_source_distance: PropTypes.number,
  nearest_water_source_distance_unit_type_code: PropTypes.string,
  noise_impact_plan: PropTypes.string,
  secure_access_plan: PropTypes.string,
  dust_impact_plan: PropTypes.string,
  visual_impact_plan: PropTypes.string,
  reclamation_backfill_detail: PropTypes.string,
  ...defaultActivity,
});

export const settlingPond = shape({
  proponent_pond_name: PropTypes.string,
  is_ponds_exfiltrated: PropTypes.boolean,
  is_ponds_recycled: PropTypes.boolean,
  is_ponds_discharged: PropTypes.boolean,
  ...defaultActivity,
});

export const surfaceBulkSamples = shape({
  processing_method_description: PropTypes.string,
  handling_instructions: PropTypes.string,
  drainage_mitigation_description: PropTypes.string,
  ...defaultActivity,
});

export const waterSupply = shape({
  supply_source_description: PropTypes.string,
  supply_source_type: PropTypes.string,
  water_use_description: PropTypes.string,
  estimate_rate: PropTypes.number,
  pump_size: PropTypes.number,
  intake_location: PropTypes.string,
  ...defaultActivity,
});

export const statueOfLand = shape({
  has_community_water_shed: PropTypes.boolean,
  has_archaeology_sites_affected: PropTypes.boolean,
});

export const importedNOWApplication = shape({
  now_application_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  mine_name: PropTypes.string,
  mine_no: PropTypes.string,
  mine_region: PropTypes.string,
  imported_to_core: PropTypes.boolean,
  notice_of_work_type_code: PropTypes.string,
  now_application_status_code: PropTypes.string,
  submitted_date: PropTypes.date,
  received_date: PropTypes.date,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  property_name: PropTypes.string,
  tenure_number: PropTypes.string,
  description_of_land: PropTypes.string,
  proposed_start_date: PropTypes.date,
  proposed_end_date: PropTypes.date,
  directions_to_site: PropTypes.string,

  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  submission_documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  blasting_operation: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  state_of_land: statueOfLand,
  camps,
  cut_lines_polarization_survey: defaultActivity,
  exploration_access: defaultActivity,
  exploration_surface_drilling: surfaceDrilling,
  mechanical_trenching: defaultActivity,
  sand_and_gravel: sandGravelQuarry,
  settling_pond: settlingPond,
  surface_bulk_sample: surfaceBulkSamples,
  underground_exploration: defaultActivity,
  water_supply: waterSupply,
  placer_operation: placer,
});
