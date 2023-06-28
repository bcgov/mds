/* eslint-disable */
// This file is for local manual testing of report generation with carbone
// requirements:
// 1. node version ^8
// 2. npm install carbone
// How to use:
// 1. specify template source file
// 2. specify rendered report file
// 3. specify data in json format (it is prepopulated with NOW json)
// 4. node .\renderReport.js

const fs = require("fs");
const carbone = require("carbone");

// template source file
const template = "";

// rendered report file
const report = "";

// options object is used to pass more parameters to carbone render function
const options = {
  convertTo: "pdf", // can be docx, txt, etc.
};

const renderPdf = (data) => {
  carbone.render(template, data, options, (err, res) => {
    if (err) {
      return console.log(err);
    }

    // fs is used to create the PDF file from the render result
    fs.writeFileSync(report, res);
    process.exit();
  });
};

const simpleRender = () => {
  // data object to inject
  const data = {
    now_application_guid: "ed04d734-80f3-4aba-8fc0-ecefdcf65cca",
    now_number: "0",
    mine_guid: "c7f28868-02b9-4cef-a077-873623bc82a6",
    mine_name: "Matthews PLC",
    mine_no: "31871563",
    mine_region: "NW",
    lead_inspector_party_guid: "5d8516c1-d0ec-4a33-8fa1-0b95b5002857",
    lead_inspector: {
      party_guid: "5d8516c1-d0ec-4a33-8fa1-0b95b5002857",
      party_type_code: "PER",
      phone_no: "840-865-1199",
      phone_ext: "123",
      email: "William.Contreras@example.com",
      party_name: "Contreras",
      name: "William Contreras",
      first_name: "William",
      address: [
        {
          suite_no: "123",
          address_line_1: "1767 Anderson Crossroad Suite 803",
          address_line_2: "Apt. 123",
          city: "Michaelland",
          sub_division_code: "KS",
          post_code: "Y1J6F0",
          address_type_code: "CAN",
        },
      ],
      mine_party_appt: [],
      job_title: null,
      postnominal_letters: null,
      idir_username: null,
      party_orgbook_entity: {},
      business_role_appts: [
        {
          party_business_role_appt_id: 3,
          party_business_role_code: "INS",
          start_date: "2020-09-23T00:00:00",
        },
      ],
      signature: null,
    },
    imported_to_core: true,
    notice_of_work_type_code: "QIM",
    now_application_status_code: "RCO",
    status_updated_date: "2020-09-23",
    decision_by_user_date: "2020-09-23",
    submitted_date: "2020-09-21",
    received_date: "2020-08-31",
    latitude: "-86.2280985",
    longitude: "16.5469340",
    property_name: "Turner, Hayes and Silva",
    tenure_number: "0",
    description_of_land: "Couple campaign parent newspaper school.",
    application_permit_type_code: null,
    proposed_start_date: "2020-09-09",
    proposed_end_date: "2020-08-25",
    directions_to_site: null,
    work_plan: "the work is aweomse",
    type_of_application: null,
    crown_grant_or_district_lot_numbers: null,
    req_access_authorization_numbers: "das sad fsd fsd dsf ",
    has_surface_disturbance_outside_tenure: false,
    is_access_gated: false,
    has_key_for_inspector: true,
    has_req_access_authorizations: true,
    application_progress: [
      {
        start_date: "2020-09-21",
        created_by: "Hamilton LLC",
        application_progress_status_code: "REV",
      },
    ],
    state_of_land: {
      has_community_water_shed: false,
      has_archaeology_sites_affected: true,
      present_land_condition_description: "dsf ",
      means_of_access_description: "dfsd",
      physiography_description: "sdf ",
      old_equipment_description: "sdf dsfsd",
      type_of_vegetation_description: "dsfsdf",
      recreational_trail_use_description: "sdfdsdsffdsf",
      arch_site_protection_plan: "asdasdsa",
      fn_engagement_activities: "asdsad",
      cultural_heritage_description: "sadasd",
      has_shared_info_with_fn: false,
      has_acknowledged_undrip: false,
      has_fn_cultural_heritage_sites_in_area: true,
      has_activity_in_park: false,
      has_auth_lieutenant_gov_council: true,
      is_on_private_land: false,
    },
    first_aid_equipment_on_site: "34324234",
    first_aid_cert_level: "324234234",
    blasting_operation: {
      has_storage_explosive_on_site: true,
      explosive_permit_issued: true,
      explosive_permit_number: "0",
      explosive_permit_expiry_date: "2020-09-29",
    },
    camp: {
      has_fuel_stored: false,
      has_fuel_stored_in_bulk: false,
      has_fuel_stored_in_barrels: true,
      details: [
        {
          activity_detail_id: 304,
          activity_type_description: "foo",
          disturbed_area: "234.00",
          timber_volume: "234.00",
        },
      ],
      reclamation_description:
        "Concern there do wide whose paper official save real off campaign clear single meet need share time success sell save open under fear truth account better trip cost still hand Mrs future knowledge talk age few how first.",
      reclamation_cost: "499602.52",
      total_disturbed_area: "496538.79",
      total_disturbed_area_unit_type_code: "MEC",
      equipment: [],
    },
    cut_lines_polarization_survey: {
      details: [
        {
          activity_detail_id: 305,
          disturbed_area: "23423.00",
          timber_volume: "32423423.00",
          cut_line_length: 234,
        },
      ],
      reclamation_description:
        "Can mind significant between church difference themselves executive majority player name southern person lawyer admit opportunity then improve challenge green or authority officer entire.",
      reclamation_cost: "495624.34",
      total_disturbed_area: "499509.91",
      total_disturbed_area_unit_type_code: "HA",
      equipment: [],
    },
    exploration_access: {
      has_proposed_bridges_or_culverts: false,
      bridge_culvert_crossing_description: "sdf sdf s",
      details: [
        {
          activity_detail_id: 306,
          activity_type_description: "1232",
          disturbed_area: "3232.00",
          timber_volume: "232.00",
          length: 32,
        },
        {
          activity_detail_id: 307,
          activity_type_description: "232",
          disturbed_area: "23.00",
          timber_volume: "23.00",
          length: 23,
        },
      ],
      reclamation_description:
        "Detail consumer available study each pressure model discussion lot finally different room young ever choice either really dark several sure few physical dinner city future occur purpose friend heavy wish keep nation fear environment out look make perform poor attention.",
      reclamation_cost: "493658.40",
      total_disturbed_area: "497455.32",
      total_disturbed_area_unit_type_code: "PER",
      equipment: [
        {
          equipment_id: 276,
          description: "323",
          quantity: 12321,
          capacity: "23213",
        },
      ],
    },
    exploration_surface_drilling: {
      reclamation_core_storage: "asdasdasdas",
      details: [
        {
          activity_detail_id: 308,
          activity_type_description: "12312",
          disturbed_area: "213123.00",
          timber_volume: "123.00",
          number_of_sites: 213123,
        },
        {
          activity_detail_id: 309,
          activity_type_description: "22",
          disturbed_area: "22.00",
          timber_volume: "22.00",
          number_of_sites: 22,
        },
      ],
      reclamation_description:
        "Buy use Republican TV executive bank computer already account physical such gas shake ago read detail center more bad huge consider actually appear suddenly might around anything value popular magazine pass two score inside right style training action among court establish part figure improve two professor team approach security sell record around man everything.",
      reclamation_cost: "499426.33",
      total_disturbed_area: "499444.85",
      total_disturbed_area_unit_type_code: "MEC",
      equipment: [],
    },
    mechanical_trenching: {
      details: [
        {
          activity_detail_id: 310,
          activity_type_description: "123",
          disturbed_area: "123.00",
          timber_volume: "12312.00",
          number_of_sites: 123,
        },
      ],
      reclamation_description:
        "With step authority religious way organization sometimes weight type science whole others themselves our have book sound coach glass represent action one free week where green however expert leave man computer east population condition might station indeed response build purpose Congress hand open by election Democrat on interesting fund themselves.",
      reclamation_cost: "496858.59",
      total_disturbed_area: "498632.67",
      total_disturbed_area_unit_type_code: "HA",
      equipment: [
        {
          equipment_id: 277,
          description: "12312",
          quantity: 123,
          capacity: "12312",
        },
      ],
    },
    placer_operation: {
      is_underground: true,
      is_hand_operation: false,
      reclamation_area: "495491.50",
      reclamation_unit_type_code: "HA",
      has_stream_diversion: false,
      proposed_production: "12312",
      details: [
        {
          activity_detail_id: 311,
          activity_type_description: "123",
          disturbed_area: "3123.00",
          timber_volume: "312312.00",
          width: 213,
          length: 21321,
          quantity: 123,
        },
      ],
      reclamation_description:
        "Pick care after suggest radio kid next bill join set kind different risk herself why ever radio because relate less agreement too place although responsibility they call avoid away amount debate appear claim citizen chair remain international enjoy seek term responsibility pick describe imagine student consumer both herself.",
      reclamation_cost: "498297.86",
      total_disturbed_area: "498182.95",
      total_disturbed_area_unit_type_code: "PER",
      equipment: [
        {
          equipment_id: 278,
          description: "12312",
          quantity: 123,
          capacity: "312312",
        },
      ],
    },
    sand_gravel_quarry_operation: {
      average_overburden_depth: "334.00",
      average_top_soil_depth: "34234.00",
      stability_measures_description: "23423",
      is_agricultural_land_reserve: true,
      agri_lnd_rsrv_permit_application_number: "23423",
      has_local_soil_removal_bylaw: true,
      community_plan: "2323",
      land_use_zoning: "324",
      proposed_land_use: "2342",
      total_mineable_reserves: 23,
      total_annual_extraction: 23,
      details: [
        {
          activity_detail_id: 312,
          activity_type_description: "12312",
          disturbed_area: "23.00",
          timber_volume: "123123.00",
        },
      ],
      reclamation_description:
        "Front nor black although start standard radio well pretty over son away until matter better four most detail draw mean should indeed military factor need leg arm effort state animal offer idea executive agree thank card too none thank goal effect hair inside success professor find draw.",
      reclamation_cost: "499969.96",
      total_disturbed_area: "499060.60",
      total_disturbed_area_unit_type_code: "MTN",
      equipment: [
        {
          equipment_id: 279,
          description: "123123",
          quantity: 1231,
          capacity: "213123",
        },
      ],
    },
    settling_pond: {
      proponent_pond_name: "Area ground loss.",
      is_ponds_exfiltrated: true,
      is_ponds_recycled: true,
      is_ponds_discharged: false,
      wastewater_facility_description: "2321312",
      disposal_from_clean_out: "123123123",
      details: [
        {
          water_source_description: "123",
          construction_plan: "123123",
          activity_detail_id: 313,
          activity_type_description: "123",
          disturbed_area: "12312.00",
          timber_volume: "213.00",
          width: 213123,
          length: 213,
          depth: 213,
        },
      ],
      reclamation_description:
        "No ok single dog hundred fire better medical approach open will leave cup move interesting produce crime five meeting new item light soldier number fund apply.",
      reclamation_cost: "498632.57",
      total_disturbed_area: "499182.71",
      total_disturbed_area_unit_type_code: "MEC",
      equipment: [],
    },
    surface_bulk_sample: {
      processing_method_description:
        "Provide second political happen situation with study those ten stock company interesting expert billion imagine avoid shoulder pretty goal research poor government front just down thousand allow throughout common successful thank professional certainly performance wrong eat center will responsibility.",
      handling_instructions:
        "Skill property start soon billion ball two pass population cover mission spend serve still American call executive office maintain often decision begin interesting especially arrive however consider radio itself together middle light moment common white scientist start boy different fight their contain day.",
      spontaneous_combustion_handling:
        "Glass participant as peace political part vote week party tree remember social above act front him individual wife deep ask ground production remain move sure law loss feeling American space mean country the would myself tell senior computer myself dream upon early paper theory eye your road inside toward.",
      has_bedrock_excavation: false,
      details: [
        {
          activity_detail_id: 314,
          activity_type_description: "2323",
          disturbed_area: "213.00",
          timber_volume: "21312321.00",
          quantity: 2312,
        },
      ],
      reclamation_description:
        "Enjoy evidence send act appear last world yeah interview site behavior what quite body her wear forward direction lot situation the bed majority far along act street analysis pressure another air fear item speech shake quality always describe law kid ability artist garden purpose phone.",
      reclamation_cost: "497409.86",
      total_disturbed_area: "497969.80",
      total_disturbed_area_unit_type_code: "MTR",
      equipment: [
        {
          equipment_id: 280,
          description: "231",
          quantity: 1,
          capacity: "123",
        },
      ],
    },
    underground_exploration: {
      proposed_bulk_sample: false,
      proposed_de_watering: false,
      proposed_diamond_drilling: false,
      proposed_mapping_chip_sampling: false,
      proposed_new_development: false,
      proposed_rehab: false,
      proposed_underground_fuel_storage: false,
      surface_total_ore_amount: 1829,
      surface_total_waste_amount: 1454,
      surface_total_ore_unit_type_code: "MEC",
      surface_total_waste_unit_type_code: "MEC",
      total_ore_amount: 1683,
      total_ore_unit_type_code: "HA",
      total_waste_amount: 523,
      total_waste_unit_type_code: "MEC",
      proposed_activity: "213424",
      details: [],
      reclamation_description:
        "Way Republican body fear major feel alone move attention arm official system watch cold new threat miss claim black radio option official area suggest participant Congress development book fight health another gun him low garden dinner could fund detail hospital something still Mr class.",
      reclamation_cost: "498369.63",
      total_disturbed_area: "499039.81",
      total_disturbed_area_unit_type_code: "HA",
      equipment: [],
    },
    water_supply: {
      details: [
        {
          supply_source_description: "123",
          water_use_description: "21312",
          estimate_rate: "31231.0000000",
          activity_detail_id: 315,
          activity_type_description: "213213",
        },
      ],
      reclamation_description:
        "But read raise foot represent but arrive real attack brother blood address ground from want rise song allow whom perform why parent item wonder decade country join himself.",
      reclamation_cost: "499739.53",
      total_disturbed_area: "496423.69",
      total_disturbed_area_unit_type_code: "MEC",
      equipment: [],
    },
    documents: [
      {
        now_application_document_xref_guid: "ff20168e-4628-4511-bc8e-4329998e6ede",
        now_application_document_type_code: "ANS",
        description: "asdasdas",
        is_final_package: true,
        mine_document: {
          mine_document_guid: "18c52603-7233-479f-9fda-e3f23d286230",
          mine_guid: "c7f28868-02b9-4cef-a077-873623bc82a6",
          document_manager_guid: "067636fb-6f50-4e67-812a-9184e743a0e5",
          document_name: "NoWApplication.pdf",
          upload_date: "2020-09-23T18:12:11.260433+00:00",
        },
      },
    ],
    submission_documents: [
      {
        id: 1,
        documenturl: null,
        filename: "team.wav",
        documenttype: null,
        description: null,
      },
    ],
    contacts: [],
    liability_adjustment: null,
    security_received_date: null,
    last_updated_date: "2020-09-23",
    is_applicant_individual_or_company: "Individual",
    relationship_to_applicant: "Agent",
    term_of_application: 7,
    merchantable_timber_volume: "30000.20",
    proposed_annual_maximum_tonnage: "777777.77",
  };

  renderPdf(data);
};

simpleRender();
