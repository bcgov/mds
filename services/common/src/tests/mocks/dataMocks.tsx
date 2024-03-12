import {
  IExplosivesPermit,
  INoticeOfDeparture,
  INoticeOfWork,
  IMineIncident,
} from "@mds/common/interfaces";
import {
  MINE_INCIDENT_DOCUMENT_TYPE_CODE,
  NodStatusSaveEnum,
  NoDTypeSaveEnum,
  VC_CRED_ISSUE_STATES,
} from "@mds/common/constants";

export const createMockHeader = () => ({
  headers: {
    "Access-Control-Allow-Origin": "*",
    Authorization: "mockToken",
  },
});

export const ERROR = { message: "Errors", status: 400 };

// used for testing selectors
export const MINE_RESPONSE = {
  mines: [
    {
      mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      mine_name: "mine3",
      mine_no: "BLAH9091",
      mine_region: "NE",
      mine_permit_numbers: [],
      major_mine_ind: true,
      mine_location: { longitude: null, latitude: null },
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: null,
      },
      mine_tailings_storage_facilities: [
        {
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f78",
          mine_tailings_storage_facility_name: "MockTSF",
          latitude: null,
          longitude: null,
          consequence_classification_status_code: "LOW",
          tsf_operating_status_code: "OPT",
          itrb_exemption_status_code: "YES",
        },
      ],
      mine_type: [
        { mine_tenure_type_code: "PLR", mine_type_detail: [] },
        { mine_tenure_type_code: "MIN", mine_type_detail: [] },
      ],
      verified_status: {
        mine_guid: null,
        mine_name: null,
        healthy_ind: null,
        verifying_user: null,
        verifying_timestamp: null,
      },
    },
    {
      mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      mine_name: "mine2",
      mine_no: "BLAH9091",
      mine_region: "NE",
      major_mine_ind: true,
      mine_permit_numbers: ["KNaaWwVdiJ40", "xfM0c0ZKEw7B"],
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: null,
      },
      mine_location: {
        longitude: null,
        latitude: null,
      },
      mine_tailings_storage_facilities: [
        {
          mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f34",
          mine_tailings_storage_facility_name: "MockTSF1",
          latitude: null,
          longitude: null,
          consequence_classification_status_code: "LOW",
          tsf_operating_status_code: "OPT",
          itrb_exemption_status_code: "YES",
        },
      ],
      mine_type: [
        { mine_tenure_type_code: "PLR", mine_type_detail: [] },
        { mine_tenure_type_code: "MIN", mine_type_detail: [] },
      ],
      verified_status: {
        mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
        mine_name: "mine2",
        healthy_ind: true,
        verifying_user: null,
        verifying_timestamp: null,
      },
    },
  ],
};

export const SUBSCRIBED_MINES = {
  mines: [
    {
      guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      mine_name: "mine3",
      mine_no: "BLAH9091",
      region_code: "NE",
      mine_permit_numbers: [],
      mine_location: { longitude: null, latitude: null },
      mine_tailings_storage_facility: [
        {
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f78",
          mine_tailings_storage_facility_name: "MockTSF",
          latitude: null,
          longitude: null,
          consequence_classification_status_code: "LOW",
          tsf_operating_status_code: "OPT",
          itrb_exemption_status_code: "YES",
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: null,
      },
    },
  ],
};
export const MINES = {
  mineIds: [
    "18133c75-49ad-4101-85f3-a43e35ae989a",
    "18145c75-49ad-0101-85f3-a43e45ae989a",
    "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
  ],
  mines: {
    "18133c75-49ad-4101-85f3-a43e35ae989a": {
      mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      mine_name: "mine3",
      mine_no: "BLAH9091",
      mine_region: "NE",
      mine_permit_numbers: [],
      major_mine_ind: true,
      mine_location: { longitude: null, latitude: null },
      mine_tailings_storage_facilities: [
        {
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f78",
          mine_tailings_storage_facility_name: "MockTSF",
          latitude: null,
          longitude: null,
          consequence_classification_status_code: "LOW",
          tsf_operating_status_code: "OPT",
          itrb_exemption_status_code: "YES",
        },
      ],
      mine_type: [
        { mine_tenure_type_code: "PLR", mine_type_detail: [] },
        { mine_tenure_type_code: "MIN", mine_type_detail: [] },
      ],
      mine_status: [
        {
          mine_status_guid: "aac99c4d-9d96-4f5a-ab6c-cc816c64ca93",
          mine_guid: "3b118b13-7397-4512-8021-c11ed90ce14c",
          mine_status_xref_guid: "4924b221-f895-479d-ad0d-7fde81795813",
          status_values: ["OP", "SEA"],
          status_labels: ["Operating", "Seasonal"],
          effective_date: "2024-03-07T15:49:45.989485+00:00",
          expiry_date: null,
          status_date: null,
          status_description:
            "This mine operates seasonally. Dates shown are from the most recently approved NoW application. Confirm operating dates with operator or permittee before visiting.",
        },
      ],
      latest_mine_status: {
        mine_status_guid: "aac99c4d-9d96-4f5a-ab6c-cc816c64ca93",
        mine_guid: "3b118b13-7397-4512-8021-c11ed90ce14c",
        mine_status_xref_guid: "4924b221-f895-479d-ad0d-7fde81795813",
        status_values: ["OP", "SEA"],
        status_labels: ["Operating", "Seasonal"],
        effective_date: "2024-03-07T15:49:45.989485+00:00",
        expiry_date: null,
        status_date: null,
        status_description:
          "This mine operates seasonally. Dates shown are from the most recently approved NoW application. Confirm operating dates with operator or permittee before visiting.",
      },
      verified_status: {
        mine_guid: null,
        mine_name: null,
        healthy_ind: null,
        verifying_user: null,
        verifying_timestamp: null,
      },
    },
    "18145c75-49ad-0101-85f3-a43e45ae989a": {
      mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      mine_name: "mine2",
      mine_no: "BLAH9091",
      major_mine_ind: true,
      mine_region: "NE",
      mine_permit_numbers: ["KNaaWwVdiJ40", "xfM0c0ZKEw7B"],
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: null,
      },
      mine_location: {
        longitude: null,
        latitude: null,
      },
      mine_tailings_storage_facilities: [
        {
          mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f34",
          mine_tailings_storage_facility_name: "MockTSF1",
          latitude: null,
          longitude: null,
          consequence_classification_status_code: "LOW",
          tsf_operating_status_code: "OPT",
          itrb_exemption_status_code: "YES",
        },
      ],
      mine_type: [
        { mine_tenure_type_code: "PLR", mine_type_detail: [] },
        { mine_tenure_type_code: "MIN", mine_type_detail: [] },
      ],
      verified_status: {
        mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
        mine_name: "mine2",
        healthy_ind: true,
        verifying_user: null,
        verifying_timestamp: null,
      },
    },
    "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d": {
      mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      mine_name: "Abbot Inc",
      mine_no: "BLAH9092",
      mine_region: "NE",
      mine_permit_numbers: [],
      major_mine_ind: true,
      mine_location: { longitude: null, latitude: null },
      mine_tailings_storage_facilities: [
        {
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f78",
          mine_tailings_storage_facility_name: "MockTSF",
          latitude: null,
          longitude: null,
          consequence_classification_status_code: "LOW",
          tsf_operating_status_code: "OPT",
          itrb_exemption_status_code: "YES",
        },
      ],
      mine_type: [
        { mine_tenure_type_code: "PLR", mine_type_detail: [] },
        { mine_tenure_type_code: "MIN", mine_type_detail: [] },
      ],
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: null,
      },
      verified_status: {
        mine_guid: null,
        mine_name: null,
        healthy_ind: null,
        verifying_user: null,
        verifying_timestamp: null,
      },
    },
  },
};

export const MINE_BASIC_INFO = [
  {
    mine_guid: "4a20dc10-fb8b-47e8-96bc-fbe287356ab5",
    mine_name: "Grant Smith",
    mine_no: "B572444",
    mine_note: "",
    major_mine_ind: true,
    region_code: "SW",
    mine_permit: [
      {
        permit_id: "25",
        permit_guid: "6515d1bf-23a9-4f36-8f12-bacbca8b138d",
        mine_guid: "4a20dc10-fb8b-47e8-96bc-fbe287356ab5",
        permit_no: "SdT1PbJX0R8c",
        permit_status_code: "C",
      },
      {
        permit_id: "24",
        permit_guid: "44a7f4c6-313d-4040-97d5-7944665d9556",
        mine_guid: "4a20dc10-fb8b-47e8-96bc-fbe287356ab5",
        permit_no: "TSRWCIB7Czc9",
        permit_status_code: "C",
      },
      {
        permit_id: "23",
        permit_guid: "b2dfa766-3de5-40d0-92f9-f31d7f98a65f",
        mine_guid: "4a20dc10-fb8b-47e8-96bc-fbe287356ab5",
        permit_no: "6oB0VXBqtzC1",
        permit_status_code: "O",
      },
    ],
    mine_status: [],
    mine_tailings_storage_facility: [],
    mine_type: [
      {
        mine_type_guid: "45388b3f-5449-4177-9962-3f78300d14af",
        mine_guid: "4a20dc10-fb8b-47e8-96bc-fbe287356ab5",
        mine_tenure_type_code: "MIN",
        mine_type_detail: [],
      },
    ],
    verified_status: null,
  },
  {
    mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
    mine_name: "Austin Myers",
    mine_no: "B905932",
    mine_note: "",
    major_mine_ind: false,
    region_code: "NW",
    mine_permit: [
      {
        permit_id: "22",
        permit_guid: "49604b29-c310-4b9f-99c9-77f3a348f8f5",
        mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
        permit_no: "3Lgy4iTpuFWR",
        permit_status_code: "C",
      },
      {
        permit_id: "21",
        permit_guid: "db8f0744-1624-452c-9b20-8fa78c816bd3",
        mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
        permit_no: "7HLtfIEMDvR9",
        permit_status_code: "C",
      },
      {
        permit_id: "20",
        permit_guid: "6f1b0d51-6e82-495c-a026-5d4494f7976e",
        mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
        permit_no: "hr1AWpnli0gq",
        permit_status_code: "O",
      },
      {
        permit_id: "19",
        permit_guid: "fa9d4d65-5444-43af-89ea-879c2441b1a0",
        mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
        permit_no: "lU1ncraKyx3n",
        permit_status_code: "O",
      },
      {
        permit_id: "18",
        permit_guid: "2c43083f-947f-4a79-b3ac-931341b7bf8d",
        mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
        permit_no: "zgxEmu4SarAx",
        permit_status_code: "O",
      },
      {
        permit_id: "17",
        permit_guid: "a86b48d8-b978-4373-a629-c19ba8bbf80c",
        mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
        permit_no: "A9b7qZudc13Y",
        permit_status_code: "O",
      },
    ],
    mine_status: [],
    mine_tailings_storage_facility: [
      {
        mine_tailings_storage_facility_guid: "7984deca-0f26-4a01-9cae-029af48e218b",
        mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
        mine_tailings_storage_facility_name: "First TSF",
        latitude: null,
        longitude: null,
        consequence_classification_status_code: "LOW",
        tsf_operating_status_code: "OPT",
        itrb_exemption_status_code: "YES",
      },
    ],
    mine_type: [
      {
        mine_type_guid: "864dcedf-bcd8-4a25-9576-b87c1c9e2fa0",
        mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
        mine_tenure_type_code: "PLR",
        mine_type_detail: [],
      },
    ],
    verified_status: null,
  },
];

export const PARTY = {
  partyIds: ["18133c75-49ad-4101-85f3-a43e35ae989a", "18145c75-49ad-0101-85f3-a43e45ae989a"],
  parties: {
    "18133c75-49ad-4101-85f3-a43e35ae989a": {
      party_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      party_name: "mock name",
      party_type_code: "PER",
      address: [{}],
      business_role_appts: [{}],
    },
    "18145c75-49ad-0101-85f3-a43e45ae989a": {
      party_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      party_name: "mock Two",
      party_type_code: "PER",
      address: [{}],
      business_role_appts: [{}],
    },
  },
  partiesWithAppointments: {
    "18133c75-49ad-4101-85f3-a43e35ae989a": {
      party_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      party_name: "mock name",
      party_type_code: "PER",
      address: [{}],
      mine_party_appt: [],
      business_role_appts: [{}],
    },
    "18145c75-49ad-0101-85f3-a43e45ae989a": {
      party_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      party_name: "mock Two",
      party_type_code: "PER",
      address: [{}],
      mine_party_appt: [],
      business_role_appts: [
        {
          end_date: "2020-08-29T00:00:00",
          party_business_role_appt_id: 275,
          party_business_role_code: "INS",
          start_date: "2020-08-11T00:00:00",
        },
      ],
    },
  },
};

export const MINE_NAME_LIST = {
  mines: [
    {
      mine_guid: "fc72863d-83e8-46ba-90f9-87b0ed78823f",
      mine_name: "New Mine",
      mine_no: "BLAH6194",
      longitude: "-119.6963833",
      latitude: "51.4961750",
    },
    {
      mine_guid: "89a65274-581d-4862-8630-99f5f7687089",
      mine_name: "Mine Two",
      mine_no: "BLAH0502",
      longitude: "-119.6963833",
      latitude: "51.4961750",
    },
    {
      mine_guid: "75692b61-7ab9-406b-b1f5-8c9b857404ac",
      mine_name: "Legit Mine",
      mine_no: "BLAH6734",
      longitude: "-119.6963833",
      latitude: "51.4961750",
    },
  ],
};

export const MINE_NO = "BLAH6666";

export const MINESPACE_USERS = [
  {
    user_id: "1",
    email: "email1@srvr.com",
    keycloak_guid: "",
    mines: [""],
  },
  {
    user_id: "2",
    email: "email2@srvr.com",
    keycloak_guid: "",
    mines: [""],
  },
  {
    user_id: "3",
    email: "email3@srvr.com",
    keycloak_guid: "",
    mines: [""],
  },
];

export const MINESPACE_RESPONSE = { records: MINESPACE_USERS };

export const PAGE_DATA = {
  current_page: 1,
  has_next: true,
  has_prev: false,
  items_per_page: 25,
  mines: [],
  next_num: 2,
  prev_num: null,
  total: 9000,
  total_pages: 360,
  records: [],
};

export const COORDINATES = [48.70707, -122.489504];
export const STATUS_OPTIONS = {
  records: [
    {
      mine_status_xref_guid: "0b14738f-7980-49ba-b447-ff5a1859dded",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "ORP",
        description: "Orphaned",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "LTM",
        description: "Long-Term Maintenance",
        active_ind: true,
      },
      description:
        "The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work is under way. There are long-term care and maintenance activities on site. Contractors are performing the work.",
    },
    {
      mine_status_xref_guid: "b001f941-2421-43a5-aade-f52fe4aecbd1",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "REC",
        description: "Reclamation",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "LTM",
        description: "Long-Term Maintenance",
        active_ind: true,
      },
      description:
        "The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.",
    },
    {
      mine_status_xref_guid: "1c04fe6a-ce61-4e0a-be69-2a4130dfaa18",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "ORP",
        description: "Orphaned",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "LWT",
        description: "Long-Term Maintenance & Water Treatment",
        active_ind: true,
      },
      description:
        "The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work is under way. There are long-term care and maintenance activities on site in addition to water treatment. Contractors are performing the work.",
    },
    {
      mine_status_xref_guid: "044f007d-caa6-4139-8891-1a65935ee595",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "REC",
        description: "Reclamation",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "LWT",
        description: "Long-Term Maintenance & Water Treatment",
        active_ind: true,
      },
      description:
        "The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site in addition to water treatment. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.",
    },
    {
      mine_status_xref_guid: "d360d834-b483-4e1a-8057-f85c9df8f184",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "REC",
        description: "Reclamation",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "PRP",
        description: "Permit Release Pending",
        active_ind: true,
      },
      description:
        "Reclamation work is complete, no additional care required. Ministry needs to return bond and close permit for mine to be Abandoned.",
    },
    {
      mine_status_xref_guid: "efe8ee38-2abe-4ca7-9e42-ff1d3a142188",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "ORP",
        description: "Orphaned",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "RNS",
        description: "Reclamation Not Started",
        active_ind: true,
      },
      description:
        "The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work has not started. A contractor has not been retained to perform the work.",
    },
    {
      mine_status_xref_guid: "c419022a-5b13-4146-b23f-770d0f4c4337",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "ORP",
        description: "Orphaned",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "SVR",
        description: "Site Visit Required",
        active_ind: true,
      },
      description:
        "The permittee is not able or available to meet permit obligations. The Ministry will take over responsibility for the mine. The site needs to be visited and assessed to determine status and work required.",
    },
    {
      mine_status_xref_guid: "1397385d-80a5-47a0-a796-e6be9c28de06",
      mine_operation_status: {
        mine_operation_status_code: "ABN",
        description: "Abandoned",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: null,
        description: null,
        active_ind: null,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "The mine site is shut down, the permit obligations have been fulfilled. Bond has been returned if permittee completed reclamation work.",
    },
    {
      mine_status_xref_guid: "4c431538-2c2c-4010-9f65-e4d67db96818",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: null,
        description: null,
        active_ind: null,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description: null,
    },
    {
      mine_status_xref_guid: "d4b402ce-84ec-4c8f-a531-5e4abc110cdc",
      mine_operation_status: {
        mine_operation_status_code: "NS",
        description: "Not Started",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: null,
        description: null,
        active_ind: null,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "No mine related work has started at this site (including exploration). The mine record may have been created as placeholder for an exploration permit. Sites with closed exploration permits that are constructing production facilities also fit into this category.",
    },
    {
      mine_status_xref_guid: "1ef87948-17f8-4a06-8589-afc1bb4f4dd6",
      mine_operation_status: {
        mine_operation_status_code: "OP",
        description: "Operating",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "SEA",
        description: "Seasonal",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "This mine operates seasonally. Dates shown are from the most recently approved NoW application. Confirm operating dates with operator or permittee before visiting.",
    },
    {
      mine_status_xref_guid: "0b86ff77-fdcf-4e81-a6fc-2401e2f53c23",
      mine_operation_status: {
        mine_operation_status_code: "OP",
        description: "Operating",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "YR",
        description: "Year-Round",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "This mine operates year-round (can be conducting exploration and/or production activities).",
    },
    {
      mine_status_xref_guid: "f3e60c05-b3df-4a6b-83b5-f5f390ca1c71",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "UN",
        description: "Unknown",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "Ministry has not determined if the permittee is able or available to meet permit obligations. A visit to the site is required.",
    },
    {
      mine_status_xref_guid: "887873b5-6298-42db-a712-3fee5946fefe",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "CM",
        description: "Care & Maintenance",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "The mine is temporarily closed. It is expected that it will eventually re-open. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.",
    },
  ],
};

export const STATUS_OPTIONS_DROPDOWN = [
  {
    children: [],
    label: "Abandoned",
    title:
      "The mine site is shut down, the permit obligations have been fulfilled. Bond has been returned if permittee completed reclamation work.",
    value: "ABN",
    isActive: true,
  },
  {
    children: [
      {
        children: [],
        label: "Care & Maintenance",
        title:
          "The mine is temporarily closed. It is expected that it will eventually re-open. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.",
        value: "CM",
        isActive: true,
      },
      {
        children: [
          {
            children: [],
            label: "Long-Term Maintenance",
            title:
              "The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work is under way. There are long-term care and maintenance activities on site. Contractors are performing the work.",
            value: "LTM",
            isActive: true,
          },
          {
            children: [],
            label: "Long-Term Maintenance & Water Treatment",
            title:
              "The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work is under way. There are long-term care and maintenance activities on site in addition to water treatment. Contractors are performing the work.",
            value: "LWT",
            isActive: true,
          },
          {
            children: [],
            label: "Reclamation Not Started",
            title:
              "The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work has not started. A contractor has not been retained to perform the work.",
            value: "RNS",
            isActive: true,
          },
          {
            children: [],
            label: "Site Visit Required",
            title:
              "The permittee is not able or available to meet permit obligations. The Ministry will take over responsibility for the mine. The site needs to be visited and assessed to determine status and work required.",
            value: "SVR",
            isActive: true,
          },
        ],
        label: "Orphaned",
        title: null,
        value: "ORP",
        isActive: true,
      },
      {
        children: [
          {
            children: [],
            label: "Long-Term Maintenance",
            title:
              "The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.",
            value: "LTM",
            isActive: true,
          },
          {
            children: [],
            label: "Long-Term Maintenance & Water Treatment",
            title:
              "The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site in addition to water treatment. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.",
            value: "LWT",
            isActive: true,
          },
          {
            children: [],
            label: "Permit Release Pending",
            title:
              "Reclamation work is complete, no additional care required. Ministry needs to return bond and close permit for mine to be Abandoned.",
            value: "PRP",
            isActive: true,
          },
        ],
        label: "Reclamation",
        title: null,
        value: "REC",
        isActive: true,
      },
      {
        children: [],
        label: "Unknown",
        title:
          "Ministry has not determined if the permittee is able or available to meet permit obligations. A visit to the site is required.",
        value: "UN",
        isActive: true,
      },
    ],
    label: "Closed",
    title: null,
    value: "CLD",
    isActive: true,
  },
  {
    children: [],
    label: "Not Started",
    title:
      "No mine related work has started at this site (including exploration). The mine record may have been created as placeholder for an exploration permit. Sites with closed exploration permits that are constructing production facilities also fit into this category.",
    value: "NS",
    isActive: true,
  },
  {
    children: [
      {
        children: [],
        label: "Seasonal",
        title:
          "This mine operates seasonally. Dates shown are from the most recently approved NoW application. Confirm operating dates with operator or permittee before visiting.",
        value: "SEA",
        isActive: true,
      },
      {
        children: [],
        label: "Year-Round",
        title:
          "This mine operates year-round (can be conducting exploration and/or production activities).",
        value: "YR",
        isActive: true,
      },
    ],
    label: "Operating",
    title:
      "This mine operates year-round (can be conducting exploration and/or production activities).",
    value: "OP",
    isActive: true,
  },
];

export const a = [
  {
    value: "CLD",
    label: "Closed",
    children: [
      {
        value: "ORP",
        label: "Orphaned",
        children: [
          { value: "LTM", label: "Long-Term Maintenance" },
          { value: "LWT", label: "Long-Term Maintenance & Water Treatment" },
          { value: "RNS", label: "Reclamation Not Started" },
          { value: "SVR", label: "Site Visit Required" },
        ],
      },
      {
        value: "REC",
        label: "Reclamation",
        children: [
          { value: "LTM", label: "Long-Term Maintenance" },
          { value: "LWT", label: "Long-Term Maintenance & Water Treatment" },
          { value: "PRP", label: "Permit Release Pending" },
        ],
      },
      { value: "UN", label: "Unknown", children: [] },
      { value: "CM", label: "Care & Maintenance", children: [] },
    ],
  },
  { value: "ABN", label: "Abandoned", children: [] },
  { value: "NS", label: "Not Started", children: [] },
  {
    value: "OP",
    label: "Operating",
    children: [
      { value: "SEA", label: "Seasonal", children: [] },
      { value: "YR", label: "Year-Round", children: [] },
    ],
  },
];

export const REGION_OPTIONS = {
  records: [
    {
      mine_region_code: "SW",
      description: "South West",
    },
    {
      mine_region_code: "SC",
      description: "South Central",
    },
    {
      mine_region_code: "NW",
      description: "North West",
    },
    {
      mine_region_code: "NE",
      description: "North East",
    },
    {
      mine_region_code: "SE",
      description: "South East",
    },
  ],
};

export const REGION_DROPDOWN_OPTIONS = [
  {
    value: "NE",
    label: "North East",
  },
  {
    value: "NW",
    label: "North West",
  },
  {
    value: "SC",
    label: "South Central",
  },
  {
    value: "SE",
    label: "South East",
  },
  {
    value: "SW",
    label: "South West",
  },
];

export const REGION_HASH = {
  SW: "South West",
  SC: "South Central",
  NW: "North West",
  NE: "North East",
  SE: "South East",
};

export const TENURE_TYPES_DROPDOWN_OPTIONS = [
  { value: "BCL", label: "BC Land", isActive: true },
  { value: "COL", label: "Coal", isActive: true },
  { value: "MIN", label: "Mineral", isActive: true },
  { value: "PLR", label: "Placer", isActive: true },
];

export const TENURE_TYPES_RESPONSE = {
  records: [
    { mine_tenure_type_code: "COL", description: "Coal" },
    { mine_tenure_type_code: "MIN", description: "Mineral" },
    { mine_tenure_type_code: "PLR", description: "Placer" },
    { mine_tenure_type_code: "BCL", description: "BC Land" },
  ],
};

export const TENURE_HASH = {
  COL: "Coal",
  MIN: "Mineral",
  PLR: "Placer",
  BCL: "BC Land",
};

export const MINE_WORK_STATUS_HASH = {
  UNK: "Unknown",
  NOT: "Not Working",
  WOR: "Working",
};

export const PERMITTEE = {
  permitteeIds: ["1c7da2c4-10d5-4c9f-994a-96427aa0c69b"],
  permittees: {
    "1c7da2c4-10d5-4c9f-994a-96427aa0c69b": {
      effective_date: "2018-10-02",
      expiry_date: null,
      party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
      party_name: "Yivihoke",
      permit_guid: "1877097f-bf9d-40c8-a5fa-53d9a79623c9",
      permittee_guid: "3491c9a5-8f09-471f-bb1b-3ea246eb9796",
      party: {
        effective_date: "2018-10-03",
        email: "JgHxeyjv@aezZIwee.com",
        expiry_date: null,
        first_name: "Tiyudoveh",
        name: "Tiyudoveh Higesewawa",
        party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
        party_name: "Higesewawa",
        party_type_code: "PER",
        phone_ext: null,
        phone_no: "123-123-1234",
      },
    },
  },
};

export const MINE_TSF_REQUIRED_REPORTS_RESPONSE = {
  records: [
    {
      req_document_guid: "05388944-afb3-4ef4-9db1-94db72f6060e",
      req_document_name: "Annual Reclamation",
      req_document_description: "10.4.4a",
      req_document_category: "TSF",
    },
    {
      req_document_guid: "ca3f5a58-d7ea-4620-a064-507450f082de",
      req_document_name: "Annual DSI",
      req_document_description: "10.4.4b",
      req_document_category: "TSF",
    },
    {
      req_document_guid: "faa99067-3639-4d9c-a3e5-5401df15ad4b",
      req_document_name: "5 year DSR",
      req_document_description: "10.5.4",
      req_document_category: "TSF",
    },
  ],
};

export const MINE_TSF_REQUIRED_REPORTS = [
  { value: "05388944-afb3-4ef4-9db1-94db72f6060e", label: "Annual Reclamation" },
  { value: "ca3f5a58-d7ea-4620-a064-507450f082de", label: "Annual DSI" },
  { value: "faa99067-3639-4d9c-a3e5-5401df15ad4b", label: "5 year DSR" },
];

export const MINE_TSF_REQUIRED_REPORTS_HASH = {
  "05388944-afb3-4ef4-9db1-94db72f6060e": "Annual Reclamation",
  "ca3f5a58-d7ea-4620-a064-507450f082de": "Annual DSI",
  "faa99067-3639-4d9c-a3e5-5401df15ad4b": "5 year DSR",
};

export const PERMITS = [
  {
    permit_id: "283",
    permit_guid: "1628847c-060b-45f2-990f-815877174801",
    mine_guid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
    permit_no: "C-12345",
    permit_status_code: "O",
    assessed_liability_total: 8000000,
    confiscated_bond_total: 500,
    active_bond_total: 700,
    permit_amendments: [
      {
        permit_amendment_guid: "822310fd-3a2c-44a9-a9ce-dee81acc9585",
        permit_guid: "71d00d45-9fda-45d3-a4b0-59a7ceb6518e",
        permit_amendment_status_code: "ACT",
        permit_amendment_type_code: "OGP",
        received_date: null,
        issue_date: "2019-04-01",
        authorization_end_date: null,
        liability_adjustment: "1000000",
        description: "Initial permit issued.",
        related_documents: [
          {
            mine_guid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
            document_guid: "31204ba5-5207-4fb5-b6c3-d47e55a0971c",
            document_name: "Adams_amendment_1.pdf",
            document_manager_guid: "64caef0e-060d-4875-a470-6c225b242723",
          },
        ],
      },
      {
        permit_amendment_guid: "8729830e-5e9a-4be8-9eef-dac4af775f1d",
        permit_guid: "71d00d45-9fda-45d3-a4b0-59a7ceb6518e",
        permit_amendment_status_code: "ACT",
        permit_amendment_type_code: "AMD",
        received_date: null,
        issue_date: "2020-04-01",
        authorization_end_date: null,
        liability_adjustment: "7000000",
        description: "Amendment",
        related_documents: [
          {
            mine_guid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
            document_guid: "31204ba5-5207-4fb5-b6c3-d47e55a0971c",
            document_name: "Adams_amendment_1.pdf",
            document_manager_guid: "64caef0e-060d-4875-a470-6c225b242723",
          },
        ],
      },
    ],
    site_properties: [
      {
        mine_type_guid: "2cf4cd5c-c7f8-4607-afe4-245ee0fd20db",
        mine_guid: "3b118b13-7397-4512-8021-c11ed90ce14c",
        permit_guid: "67074e37-b7c6-475d-ade6-eb24fdbd1e13",
        now_application_guid: null,
        mine_tenure_type_code: "MIN",
        mine_type_detail: [
          {
            mine_type_detail_xref_guid: "467cf2f1-7707-4acd-8c58-a385b3acc16f",
            mine_type_guid: "2cf4cd5c-c7f8-4607-afe4-245ee0fd20db",
            mine_disturbance_code: null,
            mine_commodity_code: "AL",
          },
          {
            mine_type_detail_xref_guid: "2bab57dd-d5d0-49bd-bd31-774fa40779db",
            mine_type_guid: "2cf4cd5c-c7f8-4607-afe4-245ee0fd20db",
            mine_disturbance_code: "UND",
            mine_commodity_code: null,
          },
        ],
      },
    ],
  },
  {
    permit_id: 2484,
    permit_guid: "67074e37-b7c6-475d-ade6-eb24fdbd1e13",
    permit_no: "M-12345",
    permit_status_code: "O",
    current_permittee: "TEST corp",
    current_permittee_guid: "c391c1ab-3652-4804-80ae-7b81b8d05ed9",
    current_permittee_digital_wallet_connection_state: "active",
    project_id: null,
    permit_amendments: [
      {
        permit_amendment_id: 2484,
        permit_no: "M-12345",
        permit_amendment_guid: "b056f07b-08ac-47ef-8ba9-98b97a060b3d",
        permit_amendment_status_code: "ACT",
        permit_amendment_type_code: "OGP",
        received_date: null,
        issue_date: "2024-03-07T00:00:00",
        authorization_end_date: "2026-03-26T00:00:00",
        liability_adjustment: "1000000.00",
        security_received_date: "2024-03-07T00:00:00",
        security_not_required: null,
        security_not_required_reason: null,
        description: "Initial permit issued.",
        issuing_inspector_title: null,
        regional_office: null,
        now_application_guid: null,
        now_application_documents: [],
        imported_now_application_documents: [],
        related_documents: [],
        permit_conditions_last_updated_by: null,
        permit_conditions_last_updated_date: null,
        has_permit_conditions: false,
        vc_credential_exch_state: null,
        conditions: [],
        is_generated_in_core: false,
        preamble_text: null,
      },
    ],
    remaining_static_liability: null,
    assessed_liability_total: 1000000,
    confiscated_bond_total: 0,
    active_bond_total: 0,
    bonds: [],
    exemption_fee_status_code: "MIM",
    exemption_fee_status_note: null,
    site_properties: {
      mine_tenure_type_code: "MIN",
      mine_commodity_code: ["AL"],
      mine_disturbance_code: ["UND"],
    },
    permit_prefix: "M",
  },
];

export const USER_ACCESS_DATA = [
  "core_view_all",
  "idir",
  "core_edit_mines",
  "offline_access",
  "admin",
  "uma_authorization",
  "core_admin",
  "core_edit_reports",
];

export const DISTURBANCE_OPTIONS = {
  records: [
    {
      description: "Surface",
      exclusive_ind: false,
      mine_disturbance_code: "SUR",
      mine_tenure_type_codes: ["COL", "MIN", "PLR", "BCL"],
    },
    {
      description: "Underground",
      exclusive_ind: false,
      mine_disturbance_code: "UND",
      mine_tenure_type_codes: ["COL", "MIN", "PLR"],
    },
    {
      description: "Coal Wash",
      exclusive_ind: true,
      mine_disturbance_code: "CWA",
      mine_tenure_type_codes: ["COL"],
    },
    {
      description: "Mill",
      exclusive_ind: true,
      mine_disturbance_code: "MIL",
      mine_tenure_type_codes: ["PLR"],
    },
  ],
};

export const DISTURBANCE_OPTIONS_HASH = {
  SUR: "Surface",
  UND: "Underground",
  CWA: "Coal Wash",
  MIL: "Mill",
};

export const COMMODITY_OPTIONS = {
  records: [
    {
      description: "Thermal Coal",
      exclusive_ind: true,
      mine_commodity_code: "TO",
      mine_tenure_type_codes: ["COL"],
    },
    {
      description: "Metallurgic",
      exclusive_ind: true,
      mine_commodity_code: "MC",
      mine_tenure_type_codes: ["COL"],
    },
    {
      description: "Construction Aggregate",
      exclusive_ind: false,
      mine_commodity_code: "CG",
      mine_tenure_type_codes: ["BCL"],
    },
  ],
};

export const DROPDOWN_COMMODITY_OPTIONS = [
  {
    value: "AE",
    label: "Agate",
    subType: null,
    isActive: true,
  },
  {
    value: "AL",
    label: "Aluminum",
    subType: null,
    isActive: true,
  },
  {
    value: "AI",
    label: "Alunite",
    subType: null,
    isActive: true,
  },
  {
    value: "AM",
    label: "Amber",
    subType: null,
    isActive: true,
  },
  {
    value: "AY",
    label: "Amethyst",
    subType: null,
    isActive: true,
  },
  {
    value: "AD",
    label: "Andalusite",
    subType: null,
    isActive: true,
  },
  {
    value: "AA",
    label: "Andesite",
    subType: null,
    isActive: true,
  },
  {
    value: "AN",
    label: "Anhydrite",
    subType: null,
    isActive: true,
  },
  {
    value: "SB",
    label: "Antimony",
    subType: null,
    isActive: true,
  },
  {
    value: "CG",
    label: "Construction Aggregate",
    subType: null,
    isActive: true,
  },
  {
    value: "MC",
    label: "Metallurgic",
    subType: null,
    isActive: true,
  },
  {
    value: "SA",
    label: "Sand and Gravel",
    subType: null,
    isActive: true,
  },
  {
    value: "TO",
    label: "Thermal Coal",
    subType: null,
    isActive: true,
  },
];

export const DROPDOWN_PROVINCE_OPTIONS = [
  {
    value: "AB",
    label: "AB",
    subType: "CAN",
    isActive: true,
  },
  {
    value: "BC",
    label: "BC",
    subType: "CAN",
    isActive: true,
  },
];

export const PROVINCE_OPTIONS = {
  records: [
    {
      description: "British Columbia",
      display_order: 10,
      sub_division_code: "BC",
      address_type_code: "CAN",
    },
    {
      description: "Alberta",
      display_order: 10,
      sub_division_code: "AB",
      address_type_code: "CAN",
    },
  ],
};

export const CONDITIONAL_COMMODITY_OPTIONS = {
  BCL: [{ label: "Construction Aggregate", value: "CG", exclusive: false }],
  COL: [
    { label: "Thermal Coal", value: "TO", exclusive: true },
    { label: "Metallurgic", value: "MC", exclusive: true },
  ],
};

export const COMMODITY_OPTIONS_HASH = {
  TO: "Thermal Coal",
  MC: "Metallurgic",
  CG: "Construction Aggregate",
};

export const CONDITIONAL_DISTURBANCE_OPTIONS = {
  BCL: [{ label: "Surface", value: "SUR", exclusive: false }],
  COL: [
    { label: "Surface", value: "SUR", exclusive: false },
    { label: "Underground", value: "UND", exclusive: false },
    { label: "Coal Wash", value: "CWA", exclusive: true },
  ],
  MIN: [
    { label: "Surface", value: "SUR", exclusive: false },
    { label: "Underground", value: "UND", exclusive: false },
  ],
  PLR: [
    { label: "Surface", value: "SUR", exclusive: false },
    { label: "Underground", value: "UND", exclusive: false },
    { label: "Mill", value: "MIL", exclusive: true },
  ],
};

export const COMPLIANCE = {
  last_inspection: "2018-12-12 00:00",
  last_inspector: "test",
  num_open_orders: 5,
  num_overdue_orders: 5,
  advisories: 5,
  warnings: 5,
  section_35_orders: 5,
  open_orders: [
    { order_no: "", report_no: "", due_date: "", inspector: "", violation: "", overdue: false },
  ],
};

export const MINE_TYPES = [
  {
    mine_tenure_type_code: [],
    mine_commodity_code: [],
    mine_disturbance_code: [],
  },
];

export const PARTYRELATIONSHIPS = [
  {
    mine_party_appt_guid: "17dbf02d-a3ba-40dd-8347-36cd04b7a49b",
    mine_guid: "db059bf5-14aa-4b98-af67-9c1e635a6120",
    party_guid: "43f513af-1142-443b-a1e6-f14ef857f4ea",
    mine_party_appt_type_code: "PMT",
    start_date: "2019-01-01",
    end_date: "2019-01-03",
    party: {
      party_guid: "43f513af-1142-443b-a1e6-f14ef857f4ea",
      party_type_code: "ORG",
      phone_no: "123-123-1234",
      phone_ext: null,
      email: "test@test.test",
      effective_date: "2019-01-02",
      expiry_date: null,
      party_name: "test company 2 ",
      name: "test company 2 ",
    },
    related_guid: "97b59b9c-8576-47cb-9a04-d7d0340730d5",
  },
  {
    mine_party_appt_guid: "17dbf02d-a3ba-40dd-8347-36cd04b7a49b",
    mine_guid: "db059bf5-14aa-4b98-af67-9c1e635a6120",
    party_guid: "43f513af-1142-443b-a1e6-f14ef857f4ea",
    mine_party_appt_type_code: "EOR",
    start_date: "2019-01-01",
    end_date: "2019-01-03",
    party: {
      party_guid: "43f513af-1142-443b-a1e6-f14ef857f4ea",
      party_type_code: "ORG",
      phone_no: "123-123-1234",
      phone_ext: null,
      email: "test@test.test",
      effective_date: "2019-01-02",
      expiry_date: null,
      party_name: "test company 2 ",
      name: "test company 2 ",
    },
    related_guid: "97b59b9c-8576-47cb-9a04-d7d0340730d5",
  },
  {
    mine_party_appt_guid: "43f513af-1142-443b-a1e6-f14ef857f4ea",
    mine_guid: "db059bf5-14aa-4b98-af67-9c1e635a6120",
    party_guid: "17dbf02d-a3ba-40dd-8347-36cd04b7a49b",
    mine_party_appt_type_code: "MMG",
    start_date: "2019-01-01",
    end_date: "2019-01-03",
    party: {
      party_guid: "97b59b9c-8576-47cb-9a04-d7d0340730d5",
      party_type_code: "PER",
      phone_no: "123-123-1234",
      phone_ext: null,
      email: "test@test.test",
      effective_date: "2019-01-02",
      expiry_date: null,
      party_name: "test dude 1 ",
      name: "test dude 1 ",
    },
    related_guid: "43f513af-1142-443b-a1e6-f14ef857f4ea",
  },
];

export const PARTY_RELATIONSHIP = [
  {
    mine_party_appt_guid: "17dbf02d-a3ba-40dd-8347-36cd04b7a49b",
    mine_guid: "db059bf5-14aa-4b98-af67-9c1e635a6120",
    party_guid: "43f513af-1142-443b-a1e6-f14ef857f4ea",
    mine_party_appt_type_code: "PMT",
    start_date: "2019-01-01",
    end_date: "2019-01-03",
    party: {
      party_guid: "43f513af-1142-443b-a1e6-f14ef857f4ea",
      party_type_code: "ORG",
      phone_no: "123-123-1234",
      phone_ext: null,
      email: "test@test.test",
      effective_date: "2019-01-02",
      expiry_date: null,
      party_name: "test company 2 ",
      name: "test company 2 ",
    },
    related_guid: "97b59b9c-8576-47cb-9a04-d7d0340730d5",
  },
];

export const MINE_INFO_HASH = { "db059bf5-14aa-4b98-af67-9c1e635a6120": "mockMineName" };

export const PARTY_RELATIONSHIP_TYPES = [
  {
    mine_party_appt_type_code: "MMG",
    description: "Mine Manager",
    display_order: "1",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "3",
  },
  {
    mine_party_appt_type_code: "PMT",
    description: "Permitee",
    display_order: "2",
    active_ind: "True",
    person: "True",
    organization: "True",
    grouping_level: "3",
  },
  {
    mine_party_appt_type_code: "MOR",
    description: "Mine Operator",
    display_order: "3",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "3",
  },
  {
    mine_party_appt_type_code: "MOW",
    description: "Mine Owner",
    display_order: "4",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "3",
  },
  {
    mine_party_appt_type_code: "EOR",
    description: "Engineer Of Record",
    display_order: "5",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "2",
  },
  {
    mine_party_appt_type_code: "EVS",
    description: "Environmental Specialist",
    display_order: "6",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "2",
  },
  {
    mine_party_appt_type_code: "EMM",
    description: "Exploration Mine Manager",
    display_order: "7",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "2",
  },
  {
    mine_party_appt_type_code: "SVR",
    description: "Supervisor",
    display_order: "8",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "1",
  },
  {
    mine_party_appt_type_code: "SHB",
    description: "Shift Boss",
    display_order: "9",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "1",
  },
  {
    mine_party_appt_type_code: "FRB",
    description: "Fire Boss",
    display_order: "10",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "1",
  },
  {
    mine_party_appt_type_code: "BLA",
    description: "Blaster",
    display_order: "11",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "1",
  },
  {
    mine_party_appt_type_code: "MRC",
    description: "Mine Rescue Contact",
    display_order: "12",
    active_ind: "True",
    person: "True",
    organization: "False",
    grouping_level: "1",
  },
];

export const PARTY_RELATIONSHIP_TYPE_HASH = {
  BLA: "Blaster",
  EMM: "Exploration Mine Manager",
  EOR: "Engineer Of Record",
  EVS: "Environmental Specialist",
  FRB: "Fire Boss",
  MMG: "Mine Manager",
  MOR: "Mine Operator",
  MOW: "Mine Owner",
  MRC: "Mine Rescue Contact",
  PMT: "Permittee",
  SHB: "Shift Boss",
  SVR: "Supervisor",
  TQP: "TSF Qualified Person",
};

export const MINEDOCUMENTS = {
  records: [
    {
      active_ind: "True",
      document_manager_guid: "4c7d88d6-e78d-48cf-a860-89b6a1e8903b",
      document_name: "05.4_Parent_Conduct.pdf",
      mine_document_guid: "11d15c31-5f0a-4a18-94de-e04e3ca7936f",
      mine_guid: "a2036de0-ce47-4f2c-a245-bbabb17cadc5",
    },
  ],
};

export const OPEN_ORDERS = [
  {
    overdue: true,
    due_date: "2019-01-31",
    order_no: "2",
    violation: "Mine isn't good enough",
    report_no: "report3",
    inspector: "George",
  },
  {
    overdue: false,
    due_date: "2019-02-28",
    order_no: "1",
    violation: "Wearing purple hats",
    report_no: "report2",
    inspector: "Paul",
  },
  {
    overdue: true,
    due_date: "2019-02-02",
    order_no: "7",
    violation: "Looks dangerous",
    report_no: "report1",
    inspector: "Paul",
  },
];

export const VARIANCES = {
  records: [
    {
      variance_guid: "0d3ec917-179f-4dbc-80a3-4c993fdfe596",
      variance_no: 1,
      compliance_article_id: 1,
      expiry_date: "2019-03-30",
      issue_date: "2019-03-01",
      note: "notesss",
      received_date: "2019-03-01",
      documents: [
        {
          created_at: "2019-05-02",
          document_manager_guid: "d7f64a25-6eaf-4bed-97fe-fd63ac347c70",
          document_name: "test.pdf",
          mine_document_guid: "33e6b965-2402-4229-a213-23bbe7fd3e99",
          mine_guid: "59e73109-48f7-4ad2-977c-3005b5bff010",
        },
      ],
    },
  ],
  current_page: 1,
  items_per_page: 5,
  total: 25,
  total_pages: 5,
};

export const VARIANCE = {
  variance_guid: "0d3ec917-179f-4dbc-80a3-4c993fdfe596",
  variance_no: 1,
  compliance_article_id: 1,
  expiry_date: "2019-03-30",
  issue_date: "2019-03-01",
  note: "notesss",
  received_date: "2019-03-01",
  documents: [
    {
      created_at: "2019-05-02",
      document_manager_guid: "d7f64a25-6eaf-4bed-97fe-fd63ac347c70",
      document_name: "test.pdf",
      mine_document_guid: "33e6b965-2402-4229-a213-23bbe7fd3e99",
      mine_guid: "59e73109-48f7-4ad2-977c-3005b5bff010",
    },
  ],
};

export const VARIANCE_PAGE_DATA = {
  records: [VARIANCE],
  current_page: 1,
  items_per_page: 25,
  total: 25,
  total_pages: 1,
};

export const COMPLIANCE_CODES = {
  records: [
    {
      article_act_code: "HSRCM",
      compliance_article_id: "305",
      description: "Spills",
      effective_date: "1970-01-01",
      expiry_date: null,
      paragraph: "7",
      section: "2",
      sub_paragraph: null,
      sub_section: "3",
    },
    {
      article_act_code: "HSRCM",
      compliance_article_id: "306",
      description: "Flammable Waste Storage",
      effective_date: "1970-01-01",
      expiry_date: null,
      paragraph: "8",
      section: "2",
      sub_paragraph: null,
      sub_section: "3",
    },
  ],
};

export const DROPDOWN_HSRCM_CODES = [
  {
    value: 305,
    label: "2.3.7 - Spills",
  },
  {
    value: 306,
    label: "2.3.8 - Flammable Waste Storage",
  },
];

export const HSRCM_HASH = {
  305: "2.3.7 - Spills",
  306: "2.3.8 - Flammable Waste Storage",
};

export const INSPECTORS = {
  results: [
    {
      core_user_guid: "51b3a499-a474-4d52-be99-5c5123d7501c",
      email: "user@gov.bc.ca",
      idir_user_detail: {
        bcgov_guid: "13b7821b-04d9-4a1d-a0f4-8f6bba2c6094",
        city: "Victoria",
        department: "Mines Health, Safety & Enforcement Division",
        title: "Geomatics Specialist",
        username: "IDIR\\BLAH",
      },
      last_logon: null,
      phone_no: "555-555-5556",
    },
  ],
};

export const INSPECTORS_DROPDOWN = [
  { value: "51b3a499-a474-4d52-be99-5c5123d7501c", label: "BLAH" },
];

export const INSPECTORS_HASH = {
  "51b3a499-a474-4d52-be99-5c5123d7501c": "BLAH",
};

export const INCIDENT: IMineIncident = {
  incident_location: "test",
  responsible_inspector_party: "test",
  update_user: "test",
  update_timestamp: "test",
  dangerous_occurrence_subparagraph_ids: [1747],
  determination_inspector_party_guid: "c002cc91-555a-4edd-9a9c-fcfee8357b00",
  determination_type_code: "DO",
  documents: [
    {
      document_manager_guid: "7b41c10c-4974-428d-a38a-ee3e8c4cee5a",
      document_name: "Amazing_PDF.pdf",
      mine_document_guid: "75855dd1-1f51-4fc1-835f-2dd99ea96f90",
      mine_incident_document_type_code: MINE_INCIDENT_DOCUMENT_TYPE_CODE.INI,
      update_user: "test",
      upload_date: "2019-07-04 14:05",
    },
  ],
  verbal_notification_provided: false,
  emergency_services_called: false,
  followup_inspection: false,
  followup_inspection_date: null,
  followup_investigation_type_code: "NO",
  incident_description: "sHDJGFJAS",
  incident_timestamp: "2019-07-04 14:05",
  mine_guid: "59e73109-48f7-4ad2-977c-3005b5bff010",
  mine_incident_guid: "036787af-51d0-4d9c-8f31-f6dc7e5b3cb3",
  mine_incident_id_year: 2019,
  mine_incident_no: null,
  mine_incident_report_no: "2019-48",
  mms_inspector_initials: null,
  number_of_fatalities: 0,
  number_of_injuries: 0,
  proponent_incident_no: "",
  recommendations: [],
  reported_by_email: "jake.doe@gmail.com",
  reported_by_name: "Jake Doe",
  reported_by_phone_ext: null,
  reported_by_phone_no: "250-360-9494",
  reported_timestamp: "2019-07-04 14:05",
  reported_to_inspector_party_guid: "c002cc91-555a-4edd-9a9c-fcfee8357b00",
  responsible_inspector_party_guid: "eda69201-b283-44ed-92b9-bcbcb5b83e69",
  status_code: "CLD",
  mine_name: "Test Mine",
  categories: [{ mine_incident_category_code: "ENV" }],
};

export const INCIDENTS = {
  records: [
    {
      mine_incident_guid: "dc101155-de3e-4f37-8303-eb6a6d2d5866",
      mine_incident_report_no: "2019-70",
      mine_incident_id_year: 2019,
      mine_guid: "3cfba01f-f8f3-4948-b488-d9e7a915f5ec",
      incident_timestamp: "2019-04-06T00:34:44+00:00",
      incident_description:
        "Paper others interview development military short design often town participant church road daughter.",
      reported_timestamp: "2019-03-17T17:42:37+00:00",
      reported_by: "Robert Bell",
      reported_by_role: "Investment banker, operational",
      followup_type_code: "NOA",
      followup_inspection_no: "721814",
      closing_report_summary:
        "Parent south person form evidence receive tree wide memory but medical car himself benefit key really series sea enter money prove if lawyer seven ready religious shake.",
    },
  ],
  current_page: 1,
  items_per_page: 5,
  total: 25,
  total_pages: 5,
};

export const MINE_INCIDENT_NOTES = {
  records: [
    {
      mine_incident_guid: "dc101155-de3e-4f37-8303-eb6a6d2d5866",
      mine_incident_note_guid: "dc101135-de3e-4f37-8603-eb6a6d2d5866",
      content: "New incident note",
    },
  ],
};

export const FOLLOWUP_ACTIONS = [
  {
    mine_incident_followup_type_code: "NOA",
    description: "No Action",
  },
];

export const SIMPLE_SEARCH_RESULTS = {
  search_terms: ["Abb"],
  search_results: [
    {
      result: {
        id: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
        value: "Abbott Inc",
      },
      score: 375,
      type: "mine",
    },
    {
      result: {
        id: "5a993f02-1006-4a07-a448-f4064294de11",
        value: "Abbott PLC",
      },
      score: 375,
      type: "mine",
    },
  ],
};

export const SEARCH_OPTIONS = [
  {
    model_id: "mine",
    description: "Mines",
  },
  {
    model_id: "party",
    description: "Contacts",
  },
  {
    model_id: "permit",
    description: "Permits",
  },
  {
    model_id: "mine_documents",
    description: "Mine Documents",
  },
  {
    model_id: "permit_documents",
    description: "Permit Documents",
  },
];

export const SEARCH_RESULTS = {
  search_terms: ["Abb"],
  search_results: {
    mine: [
      {
        result: {
          mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
          mine_name: "Abbott Inc",
          mine_no: "13353605",
          mine_region: "SW",
          mine_permit: [
            {
              permit_guid: "dfbc581b-fedf-415f-9543-b590d8ff9dcc",
              mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
              permit_no: "P-1707761",
              mine_name: "Abbott Inc",
              permitee: "Leslie Reed, Bailey and Gomez",
            },
          ],
          mine_status: [
            {
              status_labels: ["Closed", "Unknown"],
            },
          ],
        },
        score: 375,
        type: "mine",
      },
      {
        result: {
          mine_guid: "5a993f02-1006-4a07-a448-f4064294de11",
          mine_name: "Abbott PLC",
          mine_no: "63830194",
          mine_region: "SC",
          mine_permit: [
            {
              permit_guid: "ffcf7d9a-8a1a-4c56-9a2e-b5bbf82bc175",
              mine_guid: "5a993f02-1006-4a07-a448-f4064294de11",
              permit_no: "G-3117130",
              mine_name: "Abbott PLC",
              permitee: "Rachel Patterson LLC",
            },
          ],
          mine_status: [
            {
              status_labels: ["Closed", "Unknown"],
            },
          ],
        },
        score: 375,
        type: "mine",
      },
      {
        result: {
          mine_guid: "bbf2ccfe-9da6-4d88-95df-fe9997d64d96",
          mine_name: "Abbott Ltd",
          mine_no: "24326469",
          mine_region: "SW",
          mine_permit: [
            {
              permit_guid: "3528ffc0-f917-4553-aa14-639a396cbf71",
              mine_guid: "bbf2ccfe-9da6-4d88-95df-fe9997d64d96",
              permit_no: "M-8412263",
              mine_name: "Abbott Ltd",
              permitee: "Julia Martin, Chapman and White",
            },
          ],
          mine_status: [
            {
              status_labels: ["Closed"],
            },
          ],
        },
        score: 375,
        type: "mine",
      },
      {
        result: {
          mine_guid: "72de71d3-edc9-4e42-ba7b-7a18ff97a8e2",
          mine_name: "Abbott PLC",
          mine_no: "14676857",
          mine_region: "NW",
          mine_permit: [
            {
              permit_guid: "a4132a01-9d78-458a-b4d2-e7bb9ee0900b",
              mine_guid: "72de71d3-edc9-4e42-ba7b-7a18ff97a8e2",
              permit_no: "Q-9936020",
              mine_name: "Abbott PLC",
              permitee: "Cheryl Hernandez, Cook and Galvan",
            },
          ],
          mine_status: [
            {
              status_labels: ["Operating", "Year-Round"],
            },
          ],
        },
        score: 375,
        type: "mine",
      },
      {
        result: {
          mine_guid: "e8ccfdd4-c852-4116-be2c-b2cc7f3148a3",
          mine_name: "Abbott Inc",
          mine_no: "75293246",
          mine_region: "NE",
          mine_permit: [
            {
              permit_guid: "732002b5-fc47-4203-bd59-a41772392ccd",
              mine_guid: "e8ccfdd4-c852-4116-be2c-b2cc7f3148a3",
              permit_no: "CX-4742851",
              mine_name: "Abbott Inc",
              permitee: "Christina Brown PLC",
            },
          ],
          mine_status: [
            {
              status_labels: ["Closed", "Orphaned", "Site Visit Required"],
            },
          ],
        },
        score: 375,
        type: "mine",
      },
      {
        result: {
          mine_guid: "2b626772-1c3d-4e98-98d5-10d66b9d5555",
          mine_name: "Abbott-Garza",
          mine_no: "11557593",
          mine_region: "NW",
          mine_permit: [
            {
              permit_guid: "ed8395ec-b7c2-4e07-82e5-5bfb1a143bf3",
              mine_guid: "2b626772-1c3d-4e98-98d5-10d66b9d5555",
              permit_no: "G-1987651",
              mine_name: "Abbott-Garza",
              permitee: "Justin Bray Group",
            },
          ],
          mine_status: [
            {
              status_labels: ["Closed", "Reclamation", "Long-Term Maintenance"],
            },
          ],
        },
        score: 321,
        type: "mine",
      },
    ],
    party: [
      {
        result: {
          party_guid: "c0816fad-ef1d-4fa8-be74-2a57d1b3d05b",
          name: "Cody Abbott",
          email: "Cody.Abbott@example.com",
          phone_no: "401-392-0090",
          mine_party_appt: [
            {
              mine_party_appt_type_code: "EOR",
              mine: {
                mine_name: "Lopez-Hale",
              },
            },
          ],
        },
        score: 75,
        type: "party",
      },
      {
        result: {
          party_guid: "bb93b7de-8ef3-44c2-8c3c-d1ce21e98aa6",
          name: "Eric Abbott",
          email: "Eric.Abbott@example.com",
          phone_no: "659-797-6365",
          mine_party_appt: [
            {
              mine_party_appt_type_code: "EOR",
              mine: {
                mine_name: "French Inc",
              },
            },
          ],
        },
        score: 75,
        type: "party",
      },
      {
        result: {
          party_guid: "e59f15a0-4bf1-4963-9546-1009e7e96f23",
          name: "Chad Abbott",
          email: "Chad.Abbott@example.com",
          phone_no: "242-001-2306",
          mine_party_appt: [
            {
              mine_party_appt_type_code: "EOR",
              mine: {
                mine_name: "Nguyen, Case and Fernandez",
              },
            },
          ],
        },
        score: 75,
        type: "party",
      },
      {
        result: {
          party_guid: "e412fdd0-e640-4bfa-805e-86b331f29b6d",
          name: "Kyle Abbott",
          email: "Kyle.Abbott@example.com",
          phone_no: "988-817-2676",
          mine_party_appt: [
            {
              mine_party_appt_type_code: "MMG",
              mine: {
                mine_name: "Anderson-Martin",
              },
            },
          ],
        },
        score: 75,
        type: "party",
      },
      {
        result: {
          party_guid: "70bf5e33-26a2-4bfa-9841-7fe46b089712",
          name: "Lee Abbott",
          email: "Lee.Abbott@example.com",
          phone_no: "593-906-1501",
          mine_party_appt: [
            {
              mine_party_appt_type_code: "MMG",
              mine: {
                mine_name: "Garza, Kelly and Williams",
              },
            },
          ],
        },
        score: 75,
        type: "party",
      },
      {
        result: {
          party_guid: "b4058b95-a367-428c-bc85-50c2e008e96f",
          name: "Dawn Abbott",
          email: "Dawn.Abbott@example.com",
          phone_no: "743-912-5775",
          mine_party_appt: [
            {
              mine_party_appt_type_code: "MMG",
              mine: {
                mine_name: "Schmidt Ltd",
              },
            },
          ],
        },
        score: 74,
        type: "party",
      },
    ],
    permit: [
      {
        result: {
          permit_guid: "9df4593a-4b58-4cee-8c3a-1cad5df7d3f6",
          mine_guid: "5bf528d0-9e5a-421e-92c5-7e088374dad5",
          permit_no: "CX-803",
          mine_name: "Wheeler Inc",
          permitee: "Carl Taylor, Goodwin and Wade",
        },
        score: 1285,
        type: "permit",
      },
      {
        result: {
          permit_guid: "b066a984-55fc-47aa-8ecf-fb3bf33ec2bb",
          mine_guid: "d5aeba94-6d58-4617-b71e-b16a145de86e",
          permit_no: "CX-7230",
          mine_name: "Reese, Brown and Diaz",
          permitee: "Traci Franklin-Baker",
        },
        score: 1125,
        type: "permit",
      },
      {
        result: {
          permit_guid: "88280bbd-18ab-483d-94d4-94e3063622f1",
          mine_guid: "af9b3e68-981e-42cb-9931-34f37d006378",
          permit_no: "CX-4926",
          mine_name: "Mcgrath and Sons",
          permitee: "Paul Parker, Mckee and Wilson",
        },
        score: 1125,
        type: "permit",
      },
      {
        result: {
          permit_guid: "38e01cc1-bc49-430b-9453-1df508b98e64",
          mine_guid: "5392aef5-9a7b-4a94-98cd-66582fe423cb",
          permit_no: "CX-9917",
          mine_name: "Brown-Wheeler",
          permitee: "Nathaniel Harris-Randolph",
        },
        score: 1125,
        type: "permit",
      },
      {
        result: {
          permit_guid: "db1cbe69-1f13-4be3-a874-0093af1e6a49",
          mine_guid: "74b668b3-0bce-4886-a93f-25fb59783ed3",
          permit_no: "CX-7566",
          mine_name: "Williams-Baird",
          permitee: "Jeffery Jones, Benson and Frazier",
        },
        score: 1125,
        type: "permit",
      },
      {
        result: {
          permit_guid: "ab74c658-891f-4a56-9604-fa4ba694ae73",
          mine_guid: "25003e54-314e-492e-b858-5af18381c6d3",
          permit_no: "CX-63820",
          mine_name: "Harmon and Sons",
          permitee: "Denise Arroyo-Moran",
        },
        score: 999,
        type: "permit",
      },
    ],
    mine_documents: [
      {
        result: {
          mine_guid: "e56e4252-1ce2-45e7-b362-762aa144bae0",
          mine_document_guid: "f8341ebb-d673-42c1-bad2-8db22d7e3ddb",
          document_name: "above.js",
          mine_name: "Conrad Ltd",
          document_manager_guid: "a8248ab9-43d0-478a-9380-0891868e3f8d",
        },
        score: 225,
        type: "mine_documents",
      },
      {
        result: {
          mine_guid: "6f165b2a-fa60-4ed5-aa06-0aeed06659b5",
          mine_document_guid: "be071be2-346d-44dc-8f8f-fb4201b50d7e",
          document_name: "about.js",
          mine_name: "Lozano, Hanson and Smith",
          document_manager_guid: "dfc16cff-6542-4807-9ffc-af7ec00efd79",
        },
        score: 225,
        type: "mine_documents",
      },
      {
        result: {
          mine_guid: "5422ce91-774a-4ced-beba-78d36bbb8676",
          mine_document_guid: "25db4852-83dd-4916-8c10-33e1d78aa279",
          document_name: "above.avi",
          mine_name: "Rose Inc",
          document_manager_guid: "a79fb6bd-d7b8-4a92-98e6-85598a2f853f",
        },
        score: 225,
        type: "mine_documents",
      },
      {
        result: {
          mine_guid: "7f2319d0-920d-4776-8856-4903c39665db",
          mine_document_guid: "c207486f-dbdd-4b3f-99a0-a650abddf85e",
          document_name: "above.avi",
          mine_name: "Hall Ltd",
          document_manager_guid: "14bd5393-8586-4561-afbe-727fdbefcb65",
        },
        score: 225,
        type: "mine_documents",
      },
      {
        result: {
          mine_guid: "51884cec-18d8-4dc3-87a3-6ed7047056f1",
          mine_document_guid: "2c111d6b-f360-4eb5-b37d-fe9a935cd40f",
          document_name: "above.avi",
          mine_name: "Lawrence-Vargas",
          document_manager_guid: "a8034837-a710-40f8-9c3b-8ae08a444b4d",
        },
        score: 225,
        type: "mine_documents",
      },
      {
        result: {
          mine_guid: "fa173dcb-4d5c-4e3d-a3d6-e379308688ea",
          mine_document_guid: "28060d75-f434-4f58-9082-fc4a05a696ad",
          document_name: "about.js",
          mine_name: "Thomas-Jackson",
          document_manager_guid: "99e7cf58-6b48-473c-9d05-4c010839eb8d",
        },
        score: 225,
        type: "mine_documents",
      },
    ],
    permit_documents: [],
  },
};

export const MINE_SEARCH_RESULTS = [
  {
    mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
    mine_name: "Abbott Inc",
    mine_no: "13353605",
    mine_region: "SW",
    mine_permit: [
      {
        permit_guid: "dfbc581b-fedf-415f-9543-b590d8ff9dcc",
        mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
        permit_no: "P-1707761",
        mine_name: "Abbott Inc",
        permitee: "Leslie Reed, Bailey and Gomez",
      },
    ],
    mine_status: [
      {
        status_labels: ["Closed", "Unknown"],
      },
    ],
  },
  {
    mine_guid: "5a993f02-1006-4a07-a448-f4064294de11",
    mine_name: "Abbott PLC",
    mine_no: "63830194",
    mine_region: "SC",
    mine_permit: [
      {
        permit_guid: "ffcf7d9a-8a1a-4c56-9a2e-b5bbf82bc175",
        mine_guid: "5a993f02-1006-4a07-a448-f4064294de11",
        permit_no: "G-3117130",
        mine_name: "Abbott PLC",
        permitee: "Rachel Patterson LLC",
      },
    ],
    mine_status: [
      {
        status_labels: ["Closed", "Unknown"],
      },
    ],
  },
  {
    mine_guid: "bbf2ccfe-9da6-4d88-95df-fe9997d64d96",
    mine_name: "Abbott Ltd",
    mine_no: "24326469",
    mine_region: "SW",
    mine_permit: [
      {
        permit_guid: "3528ffc0-f917-4553-aa14-639a396cbf71",
        mine_guid: "bbf2ccfe-9da6-4d88-95df-fe9997d64d96",
        permit_no: "M-8412263",
        mine_name: "Abbott Ltd",
        permitee: "Julia Martin, Chapman and White",
      },
    ],
    mine_status: [
      {
        status_labels: ["Closed"],
      },
    ],
  },
  {
    mine_guid: "72de71d3-edc9-4e42-ba7b-7a18ff97a8e2",
    mine_name: "Abbott PLC",
    mine_no: "14676857",
    mine_region: "NW",
    mine_permit: [
      {
        permit_guid: "a4132a01-9d78-458a-b4d2-e7bb9ee0900b",
        mine_guid: "72de71d3-edc9-4e42-ba7b-7a18ff97a8e2",
        permit_no: "Q-9936020",
        mine_name: "Abbott PLC",
        permitee: "Cheryl Hernandez, Cook and Galvan",
      },
    ],
    mine_status: [
      {
        status_labels: ["Operating", "Year-Round"],
      },
    ],
  },
  {
    mine_guid: "e8ccfdd4-c852-4116-be2c-b2cc7f3148a3",
    mine_name: "Abbott Inc",
    mine_no: "75293246",
    mine_region: "NE",
    mine_permit: [
      {
        permit_guid: "732002b5-fc47-4203-bd59-a41772392ccd",
        mine_guid: "e8ccfdd4-c852-4116-be2c-b2cc7f3148a3",
        permit_no: "CX-4742851",
        mine_name: "Abbott Inc",
        permitee: "Christina Brown PLC",
      },
    ],
    mine_status: [
      {
        status_labels: ["Closed", "Orphaned", "Site Visit Required"],
      },
    ],
  },
  {
    mine_guid: "2b626772-1c3d-4e98-98d5-10d66b9d5555",
    mine_name: "Abbott-Garza",
    mine_no: "11557593",
    mine_region: "NW",
    mine_permit: [
      {
        permit_guid: "ed8395ec-b7c2-4e07-82e5-5bfb1a143bf3",
        mine_guid: "2b626772-1c3d-4e98-98d5-10d66b9d5555",
        permit_no: "G-1987651",
        mine_name: "Abbott-Garza",
        permitee: "Justin Bray Group",
      },
    ],
    mine_status: [
      {
        status_labels: ["Closed", "Reclamation", "Long-Term Maintenance"],
      },
    ],
  },
];

export const PERMIT_SEARCH_RESULTS = [
  {
    permit_guid: "9df4593a-4b58-4cee-8c3a-1cad5df7d3f6",
    mine_guid: "5bf528d0-9e5a-421e-92c5-7e088374dad5",
    permit_no: "CX-803",
    mine_name: "Wheeler Inc",
    permitee: "Carl Taylor, Goodwin and Wade",
  },

  {
    permit_guid: "b066a984-55fc-47aa-8ecf-fb3bf33ec2bb",
    mine_guid: "d5aeba94-6d58-4617-b71e-b16a145de86e",
    permit_no: "CX-7230",
    mine_name: "Reese, Brown and Diaz",
    permitee: "Traci Franklin-Baker",
  },

  {
    permit_guid: "88280bbd-18ab-483d-94d4-94e3063622f1",
    mine_guid: "af9b3e68-981e-42cb-9931-34f37d006378",
    permit_no: "CX-4926",
    mine_name: "Mcgrath and Sons",
    permitee: "Paul Parker, Mckee and Wilson",
  },

  {
    permit_guid: "38e01cc1-bc49-430b-9453-1df508b98e64",
    mine_guid: "5392aef5-9a7b-4a94-98cd-66582fe423cb",
    permit_no: "CX-9917",
    mine_name: "Brown-Wheeler",
    permitee: "Nathaniel Harris-Randolph",
  },

  {
    permit_guid: "db1cbe69-1f13-4be3-a874-0093af1e6a49",
    mine_guid: "74b668b3-0bce-4886-a93f-25fb59783ed3",
    permit_no: "CX-7566",
    mine_name: "Williams-Baird",
    permitee: "Jeffery Jones, Benson and Frazier",
  },

  {
    permit_guid: "ab74c658-891f-4a56-9604-fa4ba694ae73",
    mine_guid: "25003e54-314e-492e-b858-5af18381c6d3",
    permit_no: "CX-63820",
    mine_name: "Harmon and Sons",
    permitee: "Denise Arroyo-Moran",
  },
];

export const PARTY_SEARCH_RESULTS = [
  {
    party_guid: "c0816fad-ef1d-4fa8-be74-2a57d1b3d05b",
    name: "Cody Abbott",
    email: "Cody.Abbott@example.com",
    phone_no: "401-392-0090",
    mine_party_appt: [
      {
        mine_party_appt_type_code: "EOR",
        mine: {
          mine_name: "Lopez-Hale",
        },
      },
    ],
  },
  {
    party_guid: "bb93b7de-8ef3-44c2-8c3c-d1ce21e98aa6",
    name: "Eric Abbott",
    email: "Eric.Abbott@example.com",
    phone_no: "659-797-6365",
    mine_party_appt: [
      {
        mine_party_appt_type_code: "EOR",
        mine: {
          mine_name: "French Inc",
        },
      },
    ],
  },
  {
    party_guid: "e59f15a0-4bf1-4963-9546-1009e7e96f23",
    name: "Chad Abbott",
    email: "Chad.Abbott@example.com",
    phone_no: "242-001-2306",
    mine_party_appt: [
      {
        mine_party_appt_type_code: "EOR",
        mine: {
          mine_name: "Nguyen, Case and Fernandez",
        },
      },
    ],
  },
  {
    party_guid: "e412fdd0-e640-4bfa-805e-86b331f29b6d",
    name: "Kyle Abbott",
    email: "Kyle.Abbott@example.com",
    phone_no: "988-817-2676",
    mine_party_appt: [
      {
        mine_party_appt_type_code: "MMG",
        mine: {
          mine_name: "Anderson-Martin",
        },
      },
    ],
  },

  {
    party_guid: "70bf5e33-26a2-4bfa-9841-7fe46b089712",
    name: "Lee Abbott",
    email: "Lee.Abbott@example.com",
    phone_no: "593-906-1501",
    mine_party_appt: [
      {
        mine_party_appt_type_code: "MMG",
        mine: {
          mine_name: "Garza, Kelly and Williams",
        },
      },
    ],
  },

  {
    party_guid: "b4058b95-a367-428c-bc85-50c2e008e96f",
    name: "Dawn Abbott",
    email: "Dawn.Abbott@example.com",
    phone_no: "743-912-5775",
    mine_party_appt: [
      {
        mine_party_appt_type_code: "MMG",
        mine: {
          mine_name: "Schmidt Ltd",
        },
      },
    ],
  },
];

export const MINE_DOCUMENT_SEARCH_RESULTS = [
  {
    mine_guid: "e56e4252-1ce2-45e7-b362-762aa144bae0",
    mine_document_guid: "f8341ebb-d673-42c1-bad2-8db22d7e3ddb",
    document_name: "above.js",
    mine_name: "Conrad Ltd",
    document_manager_guid: "a8248ab9-43d0-478a-9380-0891868e3f8d",
  },
  {
    mine_guid: "6f165b2a-fa60-4ed5-aa06-0aeed06659b5",
    mine_document_guid: "be071be2-346d-44dc-8f8f-fb4201b50d7e",
    document_name: "about.js",
    mine_name: "Lozano, Hanson and Smith",
    document_manager_guid: "dfc16cff-6542-4807-9ffc-af7ec00efd79",
  },
  {
    mine_guid: "5422ce91-774a-4ced-beba-78d36bbb8676",
    mine_document_guid: "25db4852-83dd-4916-8c10-33e1d78aa279",
    document_name: "above.avi",
    mine_name: "Rose Inc",
    document_manager_guid: "a79fb6bd-d7b8-4a92-98e6-85598a2f853f",
  },
  {
    mine_guid: "7f2319d0-920d-4776-8856-4903c39665db",
    mine_document_guid: "c207486f-dbdd-4b3f-99a0-a650abddf85e",
    document_name: "above.avi",
    mine_name: "Hall Ltd",
    document_manager_guid: "14bd5393-8586-4561-afbe-727fdbefcb65",
  },
  {
    mine_guid: "51884cec-18d8-4dc3-87a3-6ed7047056f1",
    mine_document_guid: "2c111d6b-f360-4eb5-b37d-fe9a935cd40f",
    document_name: "above.avi",
    mine_name: "Lawrence-Vargas",
    document_manager_guid: "a8034837-a710-40f8-9c3b-8ae08a444b4d",
  },
  {
    mine_guid: "fa173dcb-4d5c-4e3d-a3d6-e379308688ea",
    mine_document_guid: "28060d75-f434-4f58-9082-fc4a05a696ad",
    document_name: "about.js",
    mine_name: "Thomas-Jackson",
    document_manager_guid: "99e7cf58-6b48-473c-9d05-4c010839eb8d",
  },
];

export const VARIANCE_DROPDOWN_STATUS_OPTIONS = [
  { value: "APP", label: "Approved", subType: null, isActive: true },
  { value: "DEN", label: "Denied", subType: null, isActive: true },
  { value: "REV", label: "In Review", subType: null, isActive: true },
  { value: "NAP", label: "Not Applicable", subType: null, isActive: true },
  { value: "RFD", label: "Ready for Decision", subType: null, isActive: true },
  { value: "WIT", label: "Withdrawn", subType: null, isActive: true },
];

export const VARIANCE_STATUS_OPTIONS_HASH = {
  REV: "In Review",
  NAP: "Not Applicable",
  APP: "Approved",
  DEN: "Denied",
  WIT: "Withdrawn",
  RFD: "Ready for Decision",
};

export const VARIANCE_DOCUMENT_CATEGORY_OPTIONS = {
  records: [
    {
      variance_document_category_code: "DEC",
      description: "Decision",
    },
    {
      variance_document_category_code: "REC",
      description: "Recommendation",
    },
    {
      variance_document_category_code: "REQ",
      description: "Request",
    },
  ],
};

export const VARIANCE_DOCUMENT_CATEGORY_OPTIONS_DROPDOWN = [
  {
    value: "REQ",
    label: "Request Document",
    isActive: true,
  },
  {
    value: "REC",
    label: "Recommendation Document",
    isActive: true,
  },
  {
    value: "DEC",
    label: "Decision Document",
    isActive: true,
  },
];

export const VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH = {
  REQ: "Request Document",
  REC: "Recommendation Document",
  DEC: "Decision Document",
};

export const INCIDENT_STATUS_OPTIONS = [
  { mine_incident_status_code: "WNS", description: "Written Notice Submitted" },
  { mine_incident_status_code: "RRS", description: "Reviewing Severity Status" },
  { mine_incident_status_code: "IMS", description: "Information Missing Status" },
  { mine_incident_status_code: "AFR", description: "Awaiting final report" },
  { mine_incident_status_code: "FRS", description: "Final report submitted" },
  { mine_incident_status_code: "UNR", description: "Under review" },
  { mine_incident_status_code: "INV", description: "Investigating" },
  { mine_incident_status_code: "MIU", description: "MIU" },
  { mine_incident_status_code: "CLD", description: "Closed" },
  { mine_incident_status_code: "DFT", description: "Draft" },
];

export const INCIDENT_STATUS_OPTIONS_HASH = {
  WNS: "Written Notice Submitted",
  RRS: "Reviewing Severity Status",
  IMS: "Information Missing Status",
  AFR: "Awaiting final report",
  FRS: "Final report submitted",
  UNR: "Under review",
  INV: "Investigating",
  MIU: "MIU",
  CLD: "Closed",
  DFT: "Draft",
};

export const INCIDENT_CATEGORY_OPTIONS_HASH = {};

export const INCIDENT_DETERMINATION = [
  {
    description: "Pending determination",
    mine_incident_determination_type_code: "PEN",
  },
  {
    active_ind: true,
    description: "This was a dangerous occurrence",
    mine_incident_determination_type_code: "DO",
  },
  {
    description: "This was not a dangerous occurrence",
    mine_incident_determination_type_code: "NDO",
  },
];

export const INCIDENT_DETERMINATION_HASH = {
  PEN: "Pending determination",
  DO: "This was a dangerous occurrence",
  NDO: "This was not a dangerous occurrence",
};

export const INCIDENT_FOLLOWUP_ACTIONS = [
  {
    description: "Yes - MIU Investigation",
    mine_incident_followup_investigation_type_code: "MIU",
  },
  {
    description: "Yes - Inspector Investigation",
    mine_incident_followup_investigation_type_code: "INS",
  },
  {
    description: "No",
    mine_incident_followup_investigation_type_code: "NO",
  },
  {
    description: "Historical - Unknown",
    mine_incident_followup_investigation_type_code: "HUK",
  },
];

export const INCIDENT_FOLLOWUP_ACTIONS_HASH = {
  MIU: "Yes - MIU Investigation",
  INS: "Yes - Inspector Investigation",
  NO: "No",
  HUK: "Historical - Unknown",
};

export const ADD_PARTY_FORM_STATE = {
  showingAddPartyForm: false,
  person: true,
  organization: true,
  partyLabel: "contact",
};

export const NOW: { applications: INoticeOfWork[] } = {
  applications: [
    {
      now_application_guid: "07e801a0-fa33-4c3b-abcc-ac6df628d483",
      mine_guid: "6e9d3426-ebf1-413f-9e5f-c3a71ab56797",
      mine_name: "Hamilton, Herrera and Mccormick",
      mine_no: "brother",
      notice_of_work_type_description: "choice",
      now_number: "44",
      now_application_status_description: "Approved",
      received_date: "2019-08-14",
      application_documents: [],
      is_historic: false,
      imported_to_core: true,
      lead_inspector_party_guid: "2bf47c5d-2c7a-4ce7-9c8b-900b9c8e755a",
      notice_of_work_type_code: "MIN",
      mine_region: "SW",
      lead_inspector_name: "Test Inspector",
      issuing_inspector_name: "Inspector Gadget",
      issuing_inspector_party_guid: "95e79bd8-a9bf-42ab-9d57-e4864bcb81fd",
      originating_system: "MMS",
    },
    {
      now_application_guid: "8e1536da-644c-4961-976b-b1326fa75825",
      mine_guid: "60300a07-376c-46f1-a984-88a813f91438",
      mine_name: "Thompson-Sullivan",
      mine_no: "other",
      notice_of_work_type_description: "technology",
      now_number: "52",
      now_application_status_description: "Approved",
      received_date: "2019-07-21",
      application_documents: [],
      is_historic: true,
      imported_to_core: false,
      lead_inspector_party_guid: "2bf47c5d-2c7a-4ce7-9c8b-900b9c8e755a",
      notice_of_work_type_code: "MIN",
      mine_region: "SW",
      lead_inspector_name: "Test Inspector",
      issuing_inspector_name: "Inspector Gadget",
      issuing_inspector_party_guid: "95e79bd8-a9bf-42ab-9d57-e4864bcb81fd",
      originating_system: "MMS",
    },
  ],
};

export const MINE_REPORT_CATEGORY_OPTIONS = {
  records: [
    { mine_report_category: "H&S", description: "Health and Safety", display_order: 10 },
    { mine_report_category: "GTC", description: "Geotechnical", display_order: 30 },
    { mine_report_category: "OTH", description: "Other", display_order: 40 },
    { mine_report_category: "GSE", description: "Geoscience and Environmental", display_order: 20 },
    { mine_report_category: "TSF", description: "Tailings Storage Facility", display_order: 31 },
  ],
};

export const MINE_REPORT_CATEGORY_OPTIONS_HASH = {
  "H&S": "Health and Safety",
  GTC: "Geotechnical",
  OTH: "Other",
  GSE: "Geoscience and Environmental",
  TSF: "Tailings Storage Facility",
};

export const MINE_REPORT_STATUS_OPTIONS_HASH = {
  NRQ: "Not Requested",
  REQ: "Changes Requested",
  REC: "Changes Received",
  ACC: "Accepted",
};

export const BULK_STATIC_CONTENT_RESPONSE = {
  EMLIContactTypes: [
    {
      emli_contact_type_code: "SHI",
      description: "Senior Health, Safety and Environment Inspector",
      active_ind: true,
    },
    {
      emli_contact_type_code: "SPI",
      description: "Senior Permitting Inspector",
      active_ind: true,
    },
    {
      emli_contact_type_code: "ROE",
      description: "Regional Office",
      active_ind: true,
    },
    {
      emli_contact_type_code: "RDR",
      description: "Regional Director",
      active_ind: true,
    },
    {
      emli_contact_type_code: "HSI",
      description: "Health and Safety Inspector",
      active_ind: true,
    },
  ],
  mineDisturbanceOptions: [
    {
      mine_disturbance_code: "SUR",
      description: "Surface",
      active_ind: true,
      mine_tenure_type_codes: ["COL", "MIN", "PLR", "BCL"],
    },
    {
      mine_disturbance_code: "UND",
      description: "Underground",
      active_ind: true,
      mine_tenure_type_codes: ["COL", "MIN", "PLR"],
    },
    {
      mine_disturbance_code: "CWA",
      description: "Coal Wash",
      active_ind: true,
      mine_tenure_type_codes: ["COL"],
    },
    {
      mine_disturbance_code: "MIL",
      description: "Mill",
      active_ind: true,
      mine_tenure_type_codes: ["PLR"],
    },
  ],
  mineCommodityOptions: [
    {
      mine_commodity_code: "TO",
      description: "Thermal Coal",
      active_ind: true,
      mine_tenure_type_codes: ["COL"],
    },
    {
      mine_commodity_code: "MC",
      description: "Metallurgic",
      active_ind: true,
      mine_tenure_type_codes: ["COL"],
    },
    {
      mine_commodity_code: "CG",
      description: "Construction Aggregate",
      active_ind: true,
      mine_tenure_type_codes: ["BCL"],
    },
    {
      mine_commodity_code: "SA",
      description: "Sand and Gravel",
      active_ind: true,
      mine_tenure_type_codes: ["BCL"],
    },
    {
      mine_commodity_code: "AE",
      description: "Agate",
      active_ind: true,
      mine_tenure_type_codes: ["MIN", "PLR"],
    },
    {
      mine_commodity_code: "AL",
      description: "Aluminum",
      active_ind: true,
      mine_tenure_type_codes: ["MIN", "PLR"],
    },
    {
      mine_commodity_code: "AI",
      description: "Alunite",
      active_ind: true,
      mine_tenure_type_codes: ["MIN", "PLR"],
    },
    {
      mine_commodity_code: "AM",
      description: "Amber",
      active_ind: true,
      mine_tenure_type_codes: ["MIN", "PLR"],
    },
    {
      mine_commodity_code: "AY",
      description: "Amethyst",
      active_ind: true,
      mine_tenure_type_codes: ["MIN", "PLR"],
    },
    {
      mine_commodity_code: "AD",
      description: "Andalusite",
      active_ind: true,
      mine_tenure_type_codes: ["MIN", "PLR"],
    },
    {
      mine_commodity_code: "AA",
      description: "Andesite",
      active_ind: true,
      mine_tenure_type_codes: ["MIN", "PLR"],
    },
    {
      mine_commodity_code: "AN",
      description: "Anhydrite",
      active_ind: true,
      mine_tenure_type_codes: ["MIN", "PLR"],
    },
    {
      mine_commodity_code: "SB",
      description: "Antimony",
      active_ind: true,
      mine_tenure_type_codes: ["MIN", "PLR"],
    },
  ],
  mineStatusOptions: [
    {
      mine_status_xref_guid: "94ac7344-ea11-4010-a8a2-826d9eefb1d3",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "ORP",
        description: "Orphaned",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "LTM",
        description: "Long-Term Maintenance",
        active_ind: true,
      },
      description:
        "The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work is under way. There are long-term care and maintenance activities on site. Contractors are performing the work.",
    },
    {
      mine_status_xref_guid: "43c1b20a-7719-4a9e-926a-6cafe25ca18c",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "REC",
        description: "Reclamation",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "LTM",
        description: "Long-Term Maintenance",
        active_ind: true,
      },
      description:
        "The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.",
    },
    {
      mine_status_xref_guid: "ef9e2d1d-b635-46a2-8f67-1a3fb736186c",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "ORP",
        description: "Orphaned",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "LWT",
        description: "Long-Term Maintenance & Water Treatment",
        active_ind: true,
      },
      description:
        "The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work is under way. There are long-term care and maintenance activities on site in addition to water treatment. Contractors are performing the work.",
    },
    {
      mine_status_xref_guid: "bbcb118f-9a16-4f77-8f2f-46f7c2b4e667",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "REC",
        description: "Reclamation",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "LWT",
        description: "Long-Term Maintenance & Water Treatment",
        active_ind: true,
      },
      description:
        "The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site in addition to water treatment. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.",
    },
    {
      mine_status_xref_guid: "35e67918-643b-4698-9464-e5d6b62afad7",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "REC",
        description: "Reclamation",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "PRP",
        description: "Permit Release Pending",
        active_ind: true,
      },
      description:
        "Reclamation work is complete, no additional care required. Ministry needs to return bond and close permit for mine to be Abandoned.",
    },
    {
      mine_status_xref_guid: "855abb0d-b104-45b5-8893-baafa52d974e",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "ORP",
        description: "Orphaned",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "RNS",
        description: "Reclamation Not Started",
        active_ind: true,
      },
      description:
        "The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work has not started. A contractor has not been retained to perform the work.",
    },
    {
      mine_status_xref_guid: "49264af9-a9c6-4971-b837-c243d71a4811",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "ORP",
        description: "Orphaned",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: "SVR",
        description: "Site Visit Required",
        active_ind: true,
      },
      description:
        "The permittee is not able or available to meet permit obligations. The Ministry will take over responsibility for the mine. The site needs to be visited and assessed to determine status and work required.",
    },
    {
      mine_status_xref_guid: "619b6b37-9e34-4413-8c8d-f906cda98ae0",
      mine_operation_status: {
        mine_operation_status_code: "ABN",
        description: "Abandoned",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: null,
        description: null,
        active_ind: null,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "The mine site is shut down, the permit obligations have been fulfilled. Bond has been returned if permittee completed reclamation work.",
    },
    {
      mine_status_xref_guid: "f6eba8e4-255f-4380-a518-27299cfc8f35",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: null,
        description: null,
        active_ind: null,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description: null,
    },
    {
      mine_status_xref_guid: "3630d968-59e0-4437-8a31-d793d0c583b4",
      mine_operation_status: {
        mine_operation_status_code: "NS",
        description: "Not Started",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: null,
        description: null,
        active_ind: null,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "No mine related work has started at this site (including exploration). The mine record may have been created as placeholder for an exploration permit. Sites with closed exploration permits that are constructing production facilities also fit into this category.",
    },
    {
      mine_status_xref_guid: "d1d74d8f-0699-41f8-b0e2-c97955b6be7e",
      mine_operation_status: {
        mine_operation_status_code: "OP",
        description: "Operating",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: null,
        description: null,
        active_ind: null,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "This mine operates year-round (can be conducting exploration and/or production activities).",
    },
    {
      mine_status_xref_guid: "08c6b6da-0d0d-45ae-8cc1-81bb6b521928",
      mine_operation_status: {
        mine_operation_status_code: "OP",
        description: "Operating",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "SEA",
        description: "Seasonal",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "This mine operates seasonally. Dates shown are from the most recently approved NoW application. Confirm operating dates with operator or permittee before visiting.",
    },
    {
      mine_status_xref_guid: "6f6fe51f-5878-49d5-a49c-26544e5ae0af",
      mine_operation_status: {
        mine_operation_status_code: "OP",
        description: "Operating",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "YR",
        description: "Year-Round",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "This mine operates year-round (can be conducting exploration and/or production activities).",
    },
    {
      mine_status_xref_guid: "7a5cc32a-fa3c-451e-977d-51feeeae0838",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "UN",
        description: "Unknown",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "Ministry has not determined if the permittee is able or available to meet permit obligations. A visit to the site is required.",
    },
    {
      mine_status_xref_guid: "85a2593b-56f6-4f51-b19a-b65b50575df3",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "ORP",
        description: "Orphaned",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description: "The permittee is not able or available to meet permit obligations.",
    },
    {
      mine_status_xref_guid: "7cf2894b-02fe-4cf5-bc62-cadfee5c46c2",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "REC",
        description: "Reclamation",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description: "The mine is closed and not expected to re-open.",
    },
    {
      mine_status_xref_guid: "4b956d18-39df-4917-a628-ea66534d602e",
      mine_operation_status: {
        mine_operation_status_code: "CLD",
        description: "Closed",
        active_ind: true,
      },
      mine_operation_status_reason: {
        mine_operation_status_reason_code: "CM",
        description: "Care & Maintenance",
        active_ind: true,
      },
      mine_operation_status_sub_reason: {
        mine_operation_status_sub_reason_code: null,
        description: null,
        active_ind: null,
      },
      description:
        "The mine is temporarily closed. It is expected that it will eventually re-open. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.",
    },
  ],
  mineRegionOptions: [
    { mine_region_code: "SW", description: "South West" },
    { mine_region_code: "SC", description: "South Central" },
    { mine_region_code: "NW", description: "North West" },
    { mine_region_code: "NE", description: "North East" },
    { mine_region_code: "SE", description: "South East" },
  ],
  mineTenureTypes: [
    { mine_tenure_type_code: "COL", description: "Coal", active_ind: true },
    { mine_tenure_type_code: "MIN", description: "Mineral", active_ind: true },
    { mine_tenure_type_code: "PLR", description: "Placer", active_ind: true },
    { mine_tenure_type_code: "BCL", description: "BC Land", active_ind: true },
  ],
  permitStatusCodes: [
    { permit_status_code: "O", description: "Open", display_order: 10 },
    { permit_status_code: "C", description: "Closed", display_order: 20 },
  ],
  incidentDocumentTypeOptions: [
    { mine_incident_document_type_code: "FIN", description: "Final Document" },
    { mine_incident_document_type_code: "INI", description: "Initial Document" },
  ],
  incidentFollowupActionOptions: [
    {
      mine_incident_followup_investigation_type_code: "MIU",
      description: "Yes - MIU Investigation",
    },
    {
      mine_incident_followup_investigation_type_code: "INS",
      description: "Yes - Inspector Investigation",
    },
    { mine_incident_followup_investigation_type_code: "NO", description: "No" },
  ],
  incidentDeterminationOptions: [
    { mine_incident_determination_type_code: "PEN", description: "Pending determination" },
    {
      mine_incident_determination_type_code: "DO",
      description: "This was a dangerous occurrence",
    },
    {
      mine_incident_determination_type_code: "NDO",
      description: "This was not a dangerous occurrence",
    },
  ],
  incidentStatusCodeOptions: [
    { mine_incident_status_code: "WNS", description: "Written Notice Submitted" },
    { mine_incident_status_code: "RSS", description: "Reviewing Severity Status" },
    { mine_incident_status_code: "IMS", description: "Information Missing Status" },
    { mine_incident_status_code: "AFR", description: "Awaiting final report" },
    { mine_incident_status_code: "FRS", description: "Final report submitted" },
    { mine_incident_status_code: "UNR", description: "Under review" },
    { mine_incident_status_code: "INV", description: "Investigating" },
    { mine_incident_status_code: "MIU", description: "MIU" },
    { mine_incident_status_code: "CLD", description: "Closed" },
    { mine_incident_status_code: "DFT", description: "Draft" },
  ],
  incidentCategoryCodeOptions: [
    {
      mine_incident_category_code: "ENV",
      description: "Environmental",
      display_order: 10,
      active_ind: true,
    },
    {
      mine_incident_category_code: "GTC",
      description: "Geotechnical",
      display_order: 20,
      active_ind: true,
    },
    {
      mine_incident_category_code: "H&S",
      description: "Health and Safety",
      display_order: 30,
      active_ind: true,
    },
    {
      mine_incident_category_code: "SPI",
      description: "Spill",
      display_order: 40,
      active_ind: true,
    },
  ],
  exemptionFeeStatusOptions: [],
  provinceOptions: [
    {
      sub_division_code: "AB",
      description: "Alberta",
      display_order: 10,
      active_ind: true,
      address_type_code: "CAN",
    },
    {
      sub_division_code: "BC",
      description: "British Columbia",
      display_order: 20,
      active_ind: true,
      address_type_code: "CAN",
    },
  ],
  complianceCodes: [
    {
      compliance_article_id: 305,
      article_act_code: "HSRCM",
      section: "2",
      sub_section: "3",
      paragraph: "7",
      sub_paragraph: null,
      description: "Spills",
      long_description: "Spills",
      effective_date: "1970-01-01",
      expiry_date: "9999-12-31",
    },
    {
      compliance_article_id: 306,
      article_act_code: "HSRCM",
      section: "2",
      sub_section: "3",
      paragraph: "8",
      sub_paragraph: null,
      description: "Flammable Waste Storage",
      long_description: "Flammable Waste Storage",
      effective_date: "1970-01-01",
      expiry_date: "9999-12-31",
    },
  ],
  varianceStatusOptions: [
    {
      variance_application_status_code: "RFD",
      description: "Ready for Decision",
      active_ind: true,
    },
    { variance_application_status_code: "WIT", description: "Withdrawn", active_ind: true },
    { variance_application_status_code: "REV", description: "In Review", active_ind: true },
    {
      variance_application_status_code: "NAP",
      description: "Not Applicable",
      active_ind: true,
    },
    { variance_application_status_code: "APP", description: "Approved", active_ind: true },
    { variance_application_status_code: "DEN", description: "Denied", active_ind: true },
  ],
  varianceDocumentCategoryOptions: [
    { variance_document_category_code: "REQ", description: "Request", active_ind: true },
    {
      variance_document_category_code: "REC",
      description: "Recommendation",
      active_ind: true,
    },
    { variance_document_category_code: "DEC", description: "Decision", active_ind: true },
  ],
  projectSummaryStatusCodes: [
    {
      project_summary_status_code: "SUB",
      description: "Submitted",
      alias_description: "Submitted",
      active_ind: true,
      display_order: 10,
    },
    {
      project_summary_status_code: "WDN",
      description: "Withdrawn",
      alias_description: "Withdrawn",
      active_ind: true,
      display_order: 30,
    },
    {
      project_summary_status_code: "DFT",
      description: "Draft",
      alias_description: "Draft",
      active_ind: true,
      display_order: 40,
    },
    {
      project_summary_status_code: "ASG",
      description: "Assigned",
      alias_description: "Submitted",
      active_ind: true,
      display_order: 50,
    },
    {
      project_summary_status_code: "UNP",
      description: "Under review - with proponent",
      alias_description: "Under review",
      active_ind: true,
      display_order: 60,
    },
    {
      project_summary_status_code: "UNR",
      description: "Under review - with reviewers",
      alias_description: "Under review",
      active_ind: true,
      display_order: 70,
    },
    {
      project_summary_status_code: "COM",
      description: "Complete",
      alias_description: "Complete",
      active_ind: true,
      display_order: 80,
    },
    {
      project_summary_status_code: "OHD",
      description: "On Hold",
      alias_description: "On Hold",
      active_ind: true,
      display_order: 90,
    },
    {
      project_summary_status_code: "IAT",
      description: "Inactive",
      alias_description: "Inactive",
      active_ind: true,
      display_order: 100,
    },
  ],
  projectSummaryDocumentTypes: [
    {
      project_summary_document_type_code: "GEN",
      description: "General",
      display_order: 10,
      active_ind: true,
    },
  ],
  mineReportDefinitionOptions: [
    {
      mine_report_definition_guid: "a1f02190-908b-4459-9dfe-6382282dfd30",
      report_name: "OHSC Annual Report",
      description: "",
      due_date_period_months: 12,
      mine_report_due_date_type: "FIS",
      default_due_date: "2020-03-31",
      categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
      compliance_articles: [
        {
          compliance_article_id: 114,
          article_act_code: "HSRCM",
          section: "1",
          sub_section: "9",
          paragraph: "3",
          sub_paragraph: null,
          description: "General",
          long_description: "General",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "1f4dac68-2131-4b12-9cdd-9e2bb86e50a2",
      report_name: "Right to Refuse Report",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "EVT",
      default_due_date: null,
      categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
      compliance_articles: [
        {
          compliance_article_id: 59,
          article_act_code: "HSRCM",
          section: "1",
          sub_section: "10",
          paragraph: "7",
          sub_paragraph: null,
          description: "Manager Investigates",
          long_description: "Manager Investigates",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "f650d2b6-96e4-43f0-9d15-6fbead2d5978",
      report_name: "Report of MERP Test",
      description: "",
      due_date_period_months: 12,
      mine_report_due_date_type: "FIS",
      default_due_date: "2020-03-31",
      categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
      compliance_articles: [
        {
          compliance_article_id: 370,
          article_act_code: "HSRCM",
          section: "3",
          sub_section: "7",
          paragraph: "1",
          sub_paragraph: null,
          description: "Mine Emergency Response Plan",
          long_description: "Mine Emergency Response Plan",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "c9baac63-1578-47eb-847d-a992e0aeba67",
      report_name: "Underground Fueling Station Report",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "PMT",
      default_due_date: null,
      categories: [
        { mine_report_category: "GSE", description: "Geoscience and Environmental" },
        { mine_report_category: "GTC", description: "Geotechnical" },
      ],
      compliance_articles: [
        {
          compliance_article_id: 510,
          article_act_code: "HSRCM",
          section: "4",
          sub_section: "3",
          paragraph: "3",
          sub_paragraph: null,
          description: "Underground Fuelling Stations",
          long_description: "Underground Fuelling Stations",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "f5dec476-cb13-430a-a85e-81e5bbe666e4",
      report_name: "Underground Oil and Grease Storage Area Report",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "PMT",
      default_due_date: null,
      categories: [
        { mine_report_category: "GSE", description: "Geoscience and Environmental" },
        { mine_report_category: "GTC", description: "Geotechnical" },
      ],
      compliance_articles: [
        {
          compliance_article_id: 511,
          article_act_code: "HSRCM",
          section: "4",
          sub_section: "3",
          paragraph: "4",
          sub_paragraph: null,
          description: "Underground Oil and Grease Storage Areas",
          long_description: "Underground Oil and Grease Storage Areas",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "ec11deae-1187-42e7-a13c-17a25743448f",
      report_name: "Flammable Gas Report",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "EVT",
      default_due_date: null,
      categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
      compliance_articles: [
        {
          compliance_article_id: 702,
          article_act_code: "HSRCM",
          section: "6",
          sub_section: "42",
          paragraph: "3",
          sub_paragraph: null,
          description: "Reporting",
          long_description: "Reporting",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "e2f72b23-d7d9-4a11-9139-e86b3c6f4bc4",
      report_name: "Free Fall Tests Report",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "EVT",
      default_due_date: null,
      categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
      compliance_articles: [
        {
          compliance_article_id: 793,
          article_act_code: "HSRCM",
          section: "7",
          sub_section: "5",
          paragraph: "13",
          sub_paragraph: null,
          description: "Free Fall Tests - Report",
          long_description: "Free Fall Tests - Report",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "b820a0e0-1d0c-4460-8787-c813484742c6",
      report_name: "Defective Explosives Report",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "EVT",
      default_due_date: null,
      categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
      compliance_articles: [
        {
          compliance_article_id: 909,
          article_act_code: "HSRCM",
          section: "8",
          sub_section: "3",
          paragraph: "4",
          sub_paragraph: null,
          description: "Defective Explosives",
          long_description: "Defective Explosives",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "82abcaf9-e432-423d-b110-73acbfa9c94f",
      report_name: "Careless Acts Report",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "EVT",
      default_due_date: null,
      categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
      compliance_articles: [
        {
          compliance_article_id: 914,
          article_act_code: "HSRCM",
          section: "8",
          sub_section: "3",
          paragraph: "9",
          sub_paragraph: null,
          description: "Careless Acts",
          long_description: "Careless Acts",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "d7f7b95c-4f60-4125-8f8c-f843d1be462e",
      report_name: "Drilling Precaution Procedures Report",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "PMT",
      default_due_date: null,
      categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
      compliance_articles: [
        {
          compliance_article_id: 955,
          article_act_code: "HSRCM",
          section: "8",
          sub_section: "7",
          paragraph: "2",
          sub_paragraph: null,
          description: "Misfired Holes and Bootlegs - Drilling Precautions",
          long_description: "Misfired Holes and Bootlegs - Drilling Precautions",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "61b87acf-8604-4975-8172-282bbf2b59fc",
      report_name: "Annual Summary of Exploration Activities",
      description: "",
      due_date_period_months: 12,
      mine_report_due_date_type: "FIS",
      default_due_date: "2020-03-31",
      categories: [
        { mine_report_category: "H&S", description: "Health and Safety" },
        { mine_report_category: "GSE", description: "Geoscience and Environmental" },
        { mine_report_category: "GTC", description: "Geotechnical" },
      ],
      compliance_articles: [
        {
          compliance_article_id: 969,
          article_act_code: "HSRCM",
          section: "9",
          sub_section: "2",
          paragraph: "1",
          sub_paragraph: null,
          description: "Notice Requirements",
          long_description: "Notice Requirements",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "ba6f37df-5ced-4664-9a5e-5a5e93a09748",
      report_name: "Management Plan for Riparian Area",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "PMT",
      default_due_date: null,
      categories: [{ mine_report_category: "GSE", description: "Geoscience and Environmental" }],
      compliance_articles: [
        {
          compliance_article_id: 978,
          article_act_code: "HSRCM",
          section: "9",
          sub_section: "5",
          paragraph: "1",
          sub_paragraph: null,
          description: "Riparian Setback Distances",
          long_description: "Riparian Setback Distances",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
    {
      mine_report_definition_guid: "c387b2a2-7bf4-4a29-9e9a-faa38a838b2d",
      report_name: "Terrain Stability Remediation Plan",
      description: "",
      due_date_period_months: null,
      mine_report_due_date_type: "EVT",
      default_due_date: null,
      categories: [
        { mine_report_category: "GSE", description: "Geoscience and Environmental" },
        { mine_report_category: "H&S", description: "Health and Safety" },
      ],
      compliance_articles: [
        {
          compliance_article_id: 980,
          article_act_code: "HSRCM",
          section: "9",
          sub_section: "7",
          paragraph: "1",
          sub_paragraph: null,
          description: "Terrain",
          long_description: "Terrain",
          effective_date: "1970-01-01",
          expiry_date: "9999-12-31",
        },
      ],
    },
  ],
  mineReportStatusOptions: [
    { mine_report_submission_status_code: "NRQ", description: "Not Requested" },
    { mine_report_submission_status_code: "REQ", description: "Changes Requested" },
    { mine_report_submission_status_code: "REC", description: "Changes Received" },
    { mine_report_submission_status_code: "ACC", description: "Accepted" },
  ],
  mineReportCategoryOptions: [
    { mine_report_category: "H&S", description: "Health and Safety" },
    { mine_report_category: "GSE", description: "Geoscience and Environmental" },
    { mine_report_category: "GTC", description: "Geotechnical" },
    { mine_report_category: "TSF", description: "Tailings Storage Facility" },
    { mine_report_category: "OTH", description: "Other" },
  ],
  partyRelationshipTypes: [],
  partyBusinessRoleOptions: [],
  noticeOfWorkActivityTypeOptions: [
    {
      activity_type_code: "cut_lines_polarization_survey",
      description: "Cut Lines and Induced Polarization Survey",
      active_ind: true,
    },
    { activity_type_code: "water_supply", description: "Water Supply", active_ind: true },
  ],
  noticeOfWorkUnitTypeOptions: [
    {
      short_description: "km",
      unit_type_code: "KMT",
      description: "Kilometer ",
      active_ind: true,
    },
    {
      short_description: "t",
      unit_type_code: "MTN",
      description: "Tonne (Metric Ton 1,000 kg)",
      active_ind: true,
    },
    {
      short_description: "m³",
      unit_type_code: "MEC",
      description: "Meters cubed",
      active_ind: true,
    },
    {
      short_description: "ha",
      unit_type_code: "HA",
      description: "Hectares",
      active_ind: true,
    },
    {
      short_description: "deg",
      unit_type_code: "DEG",
      description: "Degrees",
      active_ind: true,
    },
    {
      short_description: "%",
      unit_type_code: "PER",
      description: "Grade (Percent)",
      active_ind: true,
    },
    {
      short_description: "m",
      unit_type_code: "MTR",
      description: "Meters",
      active_ind: true,
    },
  ],
  noticeOfWorkApplicationTypeOptions: [
    {
      notice_of_work_type_code: "QCA",
      description: "Quarry - Construction Aggregate",
      active_ind: true,
    },
    { notice_of_work_type_code: "COL", description: "Coal", active_ind: true },
    { notice_of_work_type_code: "PLA", description: "Placer Operations", active_ind: true },
    { notice_of_work_type_code: "MIN", description: "Mineral", active_ind: true },
    { notice_of_work_type_code: "SAG", description: "Sand & Gravel", active_ind: true },
    {
      notice_of_work_type_code: "QIM",
      description: "Quarry - Industrial Mineral",
      active_ind: true,
    },
  ],
  noticeOfWorkApplicationStatusOptions: [
    { now_application_status_code: "SUB", description: "Submitted", active_ind: true },
    { now_application_status_code: "REF", description: "Referred", active_ind: true },
    {
      now_application_status_code: "CDI",
      description: "Client Delay Info",
      active_ind: true,
    },
    {
      now_application_status_code: "CDB",
      description: "Client Delay Bond",
      active_ind: true,
    },
    { now_application_status_code: "GVD", description: "Govt Delay", active_ind: true },
    { now_application_status_code: "CON", description: "Consultation", active_ind: true },
    {
      now_application_status_code: "AIA",
      description: "Active/Issued/Approved",
      active_ind: true,
    },
    { now_application_status_code: "WDN", description: "Withdrawn", active_ind: true },
    { now_application_status_code: "REJ", description: "Rejected", active_ind: true },
    { now_application_status_code: "CLO", description: "Closed", active_ind: true },
  ],
  noticeOfWorkApplicationDocumentTypeOptions: [
    {
      now_application_document_type_code: "PFR",
      description: "Preliminary Field Reconnaissance",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "CAL",
      description: "Acknowledgement Letter",
      now_application_document_sub_type_code: "GDO",
      document_template: {
        document_template_code: "NCL",
        form_spec: [
          {
            id: "letter_dt",
            label: "Letter Date",
            type: "DATE",
            placeholder: "YYYY-MM-DD",
            required: true,
            "context-value": "{DATETIME.UTCNOW}",
            "read-only": false,
          },
          {
            id: "mine_no",
            required: false,
            "read-only": true,
          },
          {
            id: "proponent_name",
            label: "Proponent Name",
            type: "FIELD",
            placeholder: "Enter the proponent's name",
            required: true,
            "read-only": false,
          },
          {
            id: "proponent_address",
            label: "Proponent Address",
            type: "AUTO_SIZE_FIELD",
            placeholder: "Enter the proponent's address",
            required: true,
            "read-only": false,
          },
          {
            id: "emailed_to",
            label: "Emailed to",
            type: "FIELD",
            placeholder: "Enter the name of the email recipient",
            required: false,
            "read-only": false,
          },
          {
            id: "property",
            required: false,
            "read-only": true,
          },
          {
            id: "application_dt_label",
            type: "LABEL",
            required: false,
            "context-value":
              "This letter acknowledges receipt of your Notice of Work and Reclamation Program dated",
            "read-only": false,
          },
          {
            id: "application_dt",
            label: "Application Date",
            type: "DATE",
            placeholder: "YYYY-MM-DD",
            required: true,
            "read-only": false,
          },
          {
            id: "exploration_type_label",
            type: "LABEL",
            required: false,
            "context-value": "Your proposed program of",
            "read-only": false,
          },
          {
            id: "exploration_type",
            label: "Exploration Type",
            type: "FIELD",
            placeholder: "Enter the exploration type",
            required: true,
            "read-only": false,
          },
          {
            id: "bond_inc_amt_label",
            type: "LABEL",
            required: false,
            "context-value":
              "has been referred to other resource agencies and has been sent to Indigenous Nations for consultation. Prior to the approval and issuance of your permit, you are required to post a security deposit of",
            "read-only": false,
          },
          {
            id: "bond_inc_amt",
            label: "Bond Increase Amount",
            type: "CURRENCY",
            placeholder: "Enter the bond increase amount",
            required: false,
            "read-only": false,
          },
          {
            id: "letter_body_label",
            type: "LABEL",
            required: false,
            "context-value":
              "and you may wish to take the opportunity to post your security at this time to avoid any delays.  Safekeeping Agreements backed by GIC’s may be used for bonds under $25,000 with the enclosed template. Complete the form with your banker, using the 'Instructions on Completing a Safekeeping Agreement' and return it to this office for our signature.  A copy of the completed form will be returned to you and your financial institution.  Irrevocable Letters of Credit, certified cheque, bank draft or money order made payable to the Minister of Finance, at the undernoted address, are also acceptable. Payments made by EFT can also be arranged. Please do not send cash. For reclamation surety bonds, the bond shall be with a surety licensed to transact the business of a surety in Canada. For the surety bond template and more please visit our Reclamation Security website. Personal information collected by the Ministry of Energy, Mines, and Low Carbon Innovation is under the authority of section 26(c) of the Freedom of Information and Protection of Privacy Act for the purpose of collecting Bond and Securities Data. If you have any questions about the collection, use and disclosure of your personal information, please contact: Mines Digital Services by email at mds@gov.bc.ca, by phone at: 778-698-7233, or by mail at: PO Box 9380, STN PROV GOVT, Victoria, BC, V8W 9M6.",
            "read-only": false,
          },
          {
            id: "letter_body",
            label: "Letter Body",
            type: "AUTO_SIZE_FIELD",
            required: true,
            "context-value":
              "Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation. It is your responsibility to comply with the terms and conditions of all other permits and authorizations which you may have been issued and other applicable legislation including, but not limited to the: Wildlife Act, Wildfire Act, Wildfire Regulation and the Water Sustainability Act.",
            "read-only": false,
          },
          {
            id: "issuing_inspector_name_label",
            type: "LABEL",
            required: false,
            "context-value":
              "You are reminded that no work may commence until you have received your permits. To clarify or discuss any of the above, please call or email me at the information below.\n\nSincerely,",
            "read-only": false,
          },
          {
            id: "issuing_inspector_name",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_email",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_phone",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_email",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_phone_number",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_fax_number",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_mailing_address_line_1",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_mailing_address_line_2",
            required: false,
            "read-only": true,
          },
        ],
      },
      active_ind: true,
    },
    {
      now_application_document_type_code: "WDL",
      description: "Withdrawal Letter",
      now_application_document_sub_type_code: "GDO",
      document_template: {
        document_template_code: "NWL",
        form_spec: [
          {
            id: "letter_dt",
            label: "Letter Date",
            type: "DATE",
            placeholder: "YYYY-MM-DD",
            required: true,
            "context-value": "{DATETIME.UTCNOW}",
            "read-only": false,
          },
          {
            id: "mine_no",
            required: false,
            "read-only": true,
          },
          {
            id: "proponent_name",
            label: "Proponent Name",
            type: "FIELD",
            placeholder: "Enter the proponent's name",
            required: true,
            "read-only": false,
          },
          {
            id: "proponent_address",
            label: "Proponent Address",
            type: "AUTO_SIZE_FIELD",
            placeholder: "Enter the proponent's address",
            required: true,
            "read-only": false,
          },
          {
            id: "property",
            required: false,
            "read-only": true,
          },
          {
            id: "withdrawal_dt_label",
            type: "LABEL",
            required: false,
            "context-value": "I refer to your decision of",
            "read-only": false,
          },
          {
            id: "withdrawal_dt",
            label: "Withdrawal Date",
            type: "DATE",
            placeholder: "YYYY-MM-DD",
            required: true,
            "context-value": "{DATETIME.UTCNOW}",
            "read-only": false,
          },
          {
            id: "letter_body_label",
            type: "LABEL",
            required: false,
            "context-value":
              "to withdraw your Notice of Work application and confirm that all further processing of your application has now been terminated.",
            "read-only": false,
          },
          {
            id: "letter_body",
            label: "Letter Body",
            type: "AUTO_SIZE_FIELD",
            required: true,
            "context-value":
              "You will have to reapply should you wish to carry out your intended work program. You are reminded that pursuant to Section 10 of the Mines Act no exploration activities can be carried out unless you have received the required permit.",
            "read-only": false,
          },
          {
            id: "issuing_inspector_name_label",
            type: "LABEL",
            required: false,
            "context-value": "Sincerely,",
            "read-only": false,
          },
          {
            id: "issuing_inspector_name",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_email",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_phone",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_email",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_phone_number",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_fax_number",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_mailing_address_line_1",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_mailing_address_line_2",
            required: false,
            "read-only": true,
          },
          {
            id: "application_type_code",
            required: false,
            "read-only": true,
          },
        ],
      },
      active_ind: true,
    },
    {
      now_application_document_type_code: "REV",
      description: "Review",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "ECC",
      description: "Email Correspondence/Communications",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "NPR",
      description: "No Permit Required",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "LMA",
      description: "Location Map",
      now_application_document_sub_type_code: "MDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "NPI",
      description: "No Permit Required IP",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "OMA",
      description: "Overview Map",
      now_application_document_sub_type_code: "MDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "SMA",
      description: "Supplemental Map",
      now_application_document_sub_type_code: "MDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "RFD",
      description: "Reasons for Decision",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "SOP",
      description: "Standard/Safe Operating Procedures",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "RSP",
      description: "Riparian Setbacks Plan",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "WMP",
      description: "Water Management Plan",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "WPL",
      description: "Wildlife Management Plan",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "RPL",
      description: "Reclamation Plan",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "OMP",
      description: "Other Management Plan",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "SEP",
      description: "Sediment and Erosion Control Plan",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "FDP",
      description: "Fugitive Dust Management Plan",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "VMP",
      description: "Vegetation Management Plan",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "TSS",
      description: "Terrain Stability Study",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "MAD",
      description: "Metal Leaching/Acid Rock Drainage",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "LNO",
      description: "Landowner Notification",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "DWP",
      description: "Description of Work/Work Program",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "ARE",
      description: "Agent Letter of Representation",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "AMR",
      description: "Amendment Request",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "MYA",
      description: "MYAB Update Form",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "SUD",
      description: "Supporting Documents",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "SRE",
      description: "Status Report",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "SOM",
      description: "Status Report - Overlapping Interests Maps",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "SRS",
      description: "Status Report - Shape Files",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "WFI",
      description: "30 day Warning for Information",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "WFS",
      description: "30 day Warning for Security",
      now_application_document_sub_type_code: "SDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "MPW",
      description: "Proposed and/or Permitted Mine Area Map",
      now_application_document_sub_type_code: "MDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "CRS",
      description: "Consultation Report/Summary",
      now_application_document_sub_type_code: "CDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "TMP",
      description: "Title/Tenure Map",
      now_application_document_sub_type_code: "MDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "BCR",
      description: "Begin Consultation Request",
      now_application_document_sub_type_code: "CDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "SCD",
      description: "Bond Calculator",
      now_application_document_sub_type_code: "SDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "SRB",
      description: "Scan of Reclamation Security Document",
      now_application_document_sub_type_code: "SDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "NIA",
      description: "No Interest Acknowledgement Form",
      now_application_document_sub_type_code: "SDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "AKL",
      description: "Acknowledgement of Security Letter",
      now_application_document_sub_type_code: "SDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "OTH",
      description: "Other",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "CCC",
      description: "Consultation Correspondence (not in CRTS)",
      now_application_document_sub_type_code: "CDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "CSD",
      description: "Consultation Support for Decision",
      now_application_document_sub_type_code: "CDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "BRR",
      description: "Begin Referral Request",
      now_application_document_sub_type_code: "RDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "RSR",
      description: "Referral Summary Roll Up",
      now_application_document_sub_type_code: "RDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "RLE",
      description: "Referral Letter (outside of E-Referral)",
      now_application_document_sub_type_code: "RDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "RRE",
      description: "Referral Response (outside of E-Referral)",
      now_application_document_sub_type_code: "RDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "PCA",
      description: "Advertisement",
      now_application_document_sub_type_code: "PDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "PCC",
      description: "Public Comment",
      now_application_document_sub_type_code: "PDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "PCM",
      description: "Ministry Response",
      now_application_document_sub_type_code: "PDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "RMI",
      description: "Request for More Information",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "LTM",
      description: "Land Title/Licence of Occupation Map",
      now_application_document_sub_type_code: "MDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "OTA",
      description: "Other",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "MPG",
      description: "Proposed and/or Permitted Mine Area Map",
      now_application_document_sub_type_code: "GDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "RJL",
      description: "Rejection Letter",
      now_application_document_sub_type_code: "GDO",
      document_template: {
        document_template_code: "NRL",
        form_spec: [
          {
            id: "letter_dt",
            label: "Letter Date",
            type: "DATE",
            placeholder: "YYYY-MM-DD",
            required: true,
            "context-value": "{DATETIME.UTCNOW}",
            "read-only": false,
          },
          {
            id: "mine_no",
            required: false,
            "read-only": true,
          },
          {
            id: "proponent_name",
            label: "Proponent Name",
            type: "FIELD",
            placeholder: "Enter the proponent's name",
            required: true,
            "read-only": false,
          },
          {
            id: "proponent_address",
            label: "Proponent Address",
            type: "AUTO_SIZE_FIELD",
            placeholder: "Enter the proponent's address",
            required: true,
            "read-only": false,
          },
          {
            id: "property",
            required: false,
            "read-only": true,
          },
          {
            id: "application_dt_label",
            type: "LABEL",
            required: false,
            "context-value":
              "This letter serves as formal notice that the Notice of Work and Reclamation application dated ",
            "read-only": false,
          },
          {
            id: "application_dt",
            label: "Application Date",
            type: "DATE",
            placeholder: "YYYY-MM-DD",
            required: true,
            "read-only": false,
          },
          {
            id: "letter_body_label",
            type: "LABEL",
            required: false,
            "context-value":
              "for the above noted property has been discontinued for the proposed project.",
            "read-only": false,
          },
          {
            id: "letter_body",
            label: "Letter Body",
            type: "AUTO_SIZE_FIELD",
            required: true,
            "context-value":
              "Future proposals for mining activities on the above noted property will require the submission of a new Notice of Work application. Should you require further information or have questions please do not hesitate to contact me.",
            "read-only": false,
          },
          {
            id: "issuing_inspector_name_label",
            type: "LABEL",
            required: false,
            "context-value": "Sincerely,",
            "read-only": false,
          },
          {
            id: "issuing_inspector_name",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_email",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_phone",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_email",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_phone_number",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_fax_number",
            required: true,
            "read-only": true,
          },
          {
            id: "rc_office_mailing_address_line_1",
            required: true,
            "read-only": true,
          },
          {
            id: "rc_office_mailing_address_line_2",
            required: true,
            "read-only": true,
          },
          {
            id: "application_type_code",
            required: false,
            "read-only": true,
          },
        ],
      },
      active_ind: true,
    },
    {
      now_application_document_type_code: "NPE",
      description: "Permit Enclosed Letter",
      now_application_document_sub_type_code: "GDO",
      document_template: {
        document_template_code: "NPE",
        form_spec: [
          {
            id: "letter_dt",
            label: "Letter Date",
            type: "DATE",
            placeholder: "YYYY-MM-DD",
            required: true,
            "context-value": "{DATETIME.UTCNOW}",
            "read-only": false,
          },
          {
            id: "mine_no",
            required: false,
            "read-only": true,
          },
          {
            id: "proponent_name",
            label: "Proponent Name",
            type: "FIELD",
            placeholder: "Enter the proponent's name",
            required: true,
            "read-only": false,
          },
          {
            id: "proponent_address",
            label: "Proponent Address",
            type: "AUTO_SIZE_FIELD",
            placeholder: "Enter the proponent's address",
            required: true,
            "read-only": false,
          },
          {
            id: "property",
            required: false,
            "read-only": true,
          },
          {
            id: "application_dt_label",
            type: "LABEL",
            required: false,
            "context-value":
              "Please find enclosed your Mines Act permit, which authorizes exploration activities as detailed in the Notice of Work and Reclamation Program dated",
            "read-only": false,
          },
          {
            id: "application_dt",
            label: "Application Date",
            type: "DATE",
            placeholder: "YYYY-MM-DD",
            required: true,
            "read-only": false,
          },
          {
            id: "letter_body_label",
            type: "LABEL",
            required: false,
            "context-value":
              "The Notice of Work and Reclamation Program form part of your permit, and you are reminded that you may not depart from the permitted program without written authorization.",
            "read-only": false,
          },
          {
            id: "letter_body",
            label: "Letter Body",
            type: "AUTO_SIZE_FIELD",
            required: true,
            "context-value":
              "Please ensure that you and all persons who are carrying out activities in accordance with this permit comply with all terms and conditions of the permit and are familiar with the permitted work program.\n\nThis permit applies only to the requirements under the Mines Act and Health, Safety and Reclamation Code for Mines in British Columbia (Code).  Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation. Examples of other authorizations would be for timber removal, water use, works within the agricultural land reserve etc.\n\nThe amount of your security deposit may be adjusted on the basis of reclamation performance, field inspections by this ministry, and on reports which may be requested.",
            "read-only": false,
          },
          {
            id: "issuing_inspector_name_label",
            type: "LABEL",
            required: false,
            "context-value": "Sincerely,",
            "read-only": false,
          },
          {
            id: "issuing_inspector_name",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_email",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_phone",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_email",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_phone_number",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_fax_number",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_mailing_address_line_1",
            required: false,
            "read-only": true,
          },
          {
            id: "rc_office_mailing_address_line_2",
            required: false,
            "read-only": true,
          },
          {
            id: "application_type_code",
            required: false,
            "read-only": true,
          },
        ],
      },
      active_ind: true,
    },
    {
      now_application_document_type_code: "SSF",
      description: "Submitted Shape Files",
      now_application_document_sub_type_code: "MDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "CSL",
      description: "Cross-sectional/Longitudinal",
      now_application_document_sub_type_code: "MDO",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "NTR",
      description: "Notice of Work Form",
      now_application_document_sub_type_code: "AEF",
      document_template: {
        document_template_code: "NTR",
        form_spec: [],
      },
      active_ind: true,
    },
    {
      now_application_document_type_code: "PMT",
      description: "Working Permit",
      now_application_document_sub_type_code: "AEF",
      document_template: {
        document_template_code: "PMT",
        form_spec: [
          {
            id: "mine_no",
            required: false,
            "read-only": true,
          },
          {
            id: "permittee",
            required: false,
            "read-only": true,
          },
          {
            id: "property",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_name",
            required: false,
            "read-only": true,
          },
          {
            id: "application_date",
            required: false,
            "read-only": true,
          },
          {
            id: "application_type",
            required: false,
            "read-only": true,
          },
          {
            id: "application_type_code",
            required: false,
            "read-only": true,
          },
        ],
      },
      active_ind: true,
    },
    {
      now_application_document_type_code: "PMA",
      description: "Working Permit for Amendment",
      now_application_document_sub_type_code: "AEF",
      document_template: {
        document_template_code: "PMA",
        form_spec: [
          {
            id: "mine_no",
            required: false,
            "read-only": true,
          },
          {
            id: "permittee",
            required: false,
            "read-only": true,
          },
          {
            id: "property",
            required: false,
            "read-only": true,
          },
          {
            id: "issuing_inspector_name",
            required: false,
            "read-only": true,
          },
          {
            id: "application_date",
            required: false,
            "read-only": true,
          },
          {
            id: "application_type",
            required: false,
            "read-only": true,
          },
          {
            id: "application_type_code",
            required: false,
            "read-only": true,
          },
        ],
      },
      active_ind: true,
    },
    {
      now_application_document_type_code: "ANS",
      description: "Annual Summary",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "ACP",
      description: "Archaeological Chance Find Procedure",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "BLP",
      description: "Blasting Procedure",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "EMS",
      description: "Explosives Magazine Storage and Use Permit Application",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "LAL",
      description: "Landowner Authorization Letter",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "MRP",
      description: "Mine Emergency Response Plan",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "RFE",
      description: "Record of First Nations Engagement",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "TAL",
      description: "Tenure Authorization Letter",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "AOA",
      description: "Archaeological Overview Assessment",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
    {
      now_application_document_type_code: "AIA",
      description: "Archaeological Impact Assessment",
      now_application_document_sub_type_code: "AAF",
      document_template: {},
      active_ind: true,
    },
  ],
  noticeOfWorkUndergroundExplorationTypeOptions: [
    { underground_exploration_type_code: "NEW", description: "New", active_ind: true },
    {
      underground_exploration_type_code: "RHB",
      description: "Rehabilitation",
      active_ind: true,
    },
    { underground_exploration_type_code: "SUR", description: "Surface", active_ind: true },
  ],
  noticeOfWorkApplicationProgressStatusCodeOptions: [
    { application_progress_status_code: "VER", description: "Verification" },
    { application_progress_status_code: "REV", description: "Technical Review" },
    { application_progress_status_code: "REF", description: "Referral / Consultation" },
    { application_progress_status_code: "DEC", description: "Decision" },
  ],
  noticeOfWorkApplicationPermitTypeOptions: [
    {
      now_application_permit_type_code: "MY-ABP",
      description: "Multi-Year, Area-Based Permit",
      active_ind: true,
    },
    {
      now_application_permit_type_code: "OYP",
      description: "One-Year Permit",
      active_ind: true,
    },
    {
      now_application_permit_type_code: "MYP",
      description: "Multi-Year Permit",
      active_ind: true,
    },
  ],
  noticeOfWorkApplicationReviewOptions: [
    { now_application_review_type_code: "REF", description: "Referral" },
    { now_application_review_type_code: "FNC", description: "First Nations Consultation" },
    { now_application_review_type_code: "PUB", description: "Public Comment" },
  ],
  bondStatusOptions: [
    { bond_status_code: "REL", description: "Released", active_ind: true },
    { bond_status_code: "CON", description: "Confiscated", active_ind: true },
    { bond_status_code: "ACT", description: "Active", active_ind: true },
  ],
  bondTypeOptions: [
    { bond_type_code: "CEC", description: "Certified Cheque", active_ind: true },
    { bond_type_code: "CAS", description: "Cash", active_ind: true },
    { bond_type_code: "ILC", description: "Irrevocable Letter of Credit", active_ind: true },
    { bond_type_code: "MOR", description: "Money Order", active_ind: true },
    { bond_type_code: "BDA", description: "Bank Draft", active_ind: true },
    { bond_type_code: "SBO", description: "Surety Bond", active_ind: true },
    { bond_type_code: "SAG", description: "Safekeeping Agreement", active_ind: true },
  ],
  bondDocumentTypeOptions: [
    {
      bond_document_type_code: "SRB",
      description: "Scan of Reclamation Security Bond",
      active_ind: true,
    },
    {
      bond_document_type_code: "RSF",
      description: "Release of Security Form",
      active_ind: true,
    },
    {
      bond_document_type_code: "RSL",
      description: "Release of Security Letter",
      active_ind: true,
    },
    {
      bond_document_type_code: "CSF",
      description: "Confiscation of Security Form",
      active_ind: true,
    },
    {
      bond_document_type_code: "CSL",
      description: "Confiscation of Security Letter",
      active_ind: true,
    },
    { bond_document_type_code: "REL", description: "Reminder Letter", active_ind: true },
    {
      bond_document_type_code: "AKL",
      description: "Acknowledgement Letter",
      active_ind: true,
    },
  ],
  permitConditionTypeOptions: [
    {
      condition_type_code: "SEC",
      description: "Permit Section",
      display_order: 10,
    },
    {
      condition_type_code: "CON",
      description: "Condition",
      display_order: 20,
    },
    {
      condition_type_code: "LIS",
      description: "List Item",
      display_order: 30,
    },
  ],
  permitConditionCategoryOptions: [
    {
      condition_category_code: "GEC",
      description: "General Conditions",
      display_order: 10,
    },
    {
      condition_category_code: "HSC",
      description: "Health and Safety Conditions",
      display_order: 20,
    },
    {
      condition_category_code: "GOC",
      description: "Geotechnical Conditions",
      display_order: 30,
    },
    {
      condition_category_code: "ELC",
      description: "Environmental Land and Watercourses Conditions",
      display_order: 40,
    },
    {
      condition_category_code: "RCC",
      description: "Reclamation and Closure Program Conditions",
      display_order: 50,
    },
  ],
  permitAmendmentTypeCodeOptions: [
    {
      permit_amendment_type_code: "OGP",
      description: "Original Permit",
      display_order: 10,
      active_ind: true,
    },
    {
      permit_amendment_type_code: "AMD",
      description: "Permit Amendment",
      display_order: 20,
      active_ind: true,
    },
    {
      permit_amendment_type_code: "ALG",
      description: "Amalgamated Permit",
      display_order: 30,
      active_ind: true,
    },
  ],
  noticeOfWorkApplicationDelayOptions: [],
  applicationReasonCodeOptions: [],
  applicationSourceTypeCodeOptions: [],
  consequenceClassificationStatusCodeOptions: [
    {
      consequence_classification_status_code: "LOW",
      description: "Low",
      active_ind: true,
    },
    {
      consequence_classification_status_code: "SIG",
      description: "Significant",
      active_ind: true,
    },
    {
      consequence_classification_status_code: "HIG",
      description: "High",
      active_ind: true,
    },
    {
      consequence_classification_status_code: "VHIG",
      description: "Very High",
      active_ind: true,
    },
    {
      consequence_classification_status_code: "EXT",
      description: "Extreme",
      active_ind: true,
    },
    {
      consequence_classification_status_code: "NRT",
      description: "Not Rated",
      active_ind: true,
    },
  ],
  itrbExemptionStatusCodeOptions: [
    {
      itrb_exemption_status_code: "YES",
      description: "Yes",
      active_ind: true,
    },
    {
      itrb_exemption_status_code: "NO",
      description: "No",
      active_ind: true,
    },
    {
      itrb_exemption_status_code: "EXEM",
      description: "Exemption",
      active_ind: true,
    },
  ],
  TSFOperatingStatusCodeOptions: [
    {
      tsf_operating_status_code: "CLO",
      description: "Closed",
      active_ind: true,
    },
    {
      tsf_operating_status_code: "OPT",
      description: "Operating",
      active_ind: true,
    },
    {
      tsf_operating_status_code: "CAM",
      description: "Inactive (C&M)",
      active_ind: true,
    },
  ],
  explosivesPermitStatus: [
    {
      explosives_permit_status_code: "APP",
      description: "Approved",
      active_ind: true,
    },
    {
      explosives_permit_status_code: "REJ",
      description: "Rejected",
      active_ind: true,
    },
    {
      explosives_permit_status_code: "WIT",
      description: "Withdrawn",
      active_ind: true,
    },
    {
      explosives_permit_status_code: "REC",
      description: "Received",
      active_ind: true,
    },
  ],
  explosivesPermitDocumentType: [
    {
      explosives_permit_document_type_code: "PER",
      description: "Explosives Storage and Use Permit",
      active_ind: true,
    },
    {
      explosives_permit_document_type_code: "LET",
      description: "Explosives Storage and Use Permit Letter",
      active_ind: true,
    },
    {
      explosives_permit_document_type_code: "BLA",
      description: "Blasting Plan",
      active_ind: true,
    },
  ],
  explosivesPermitMagazineType: [
    {
      explosives_permit_magazine_type_code: "EXP",
      description: "Explosives Magazine",
    },
    {
      explosives_permit_magazine_type_code: "DET",
      description: "Detonator Magazine",
    },
  ],
  projectSummaryAuthorizationTypes: [
    {
      project_summary_authorization_type: "MINES_ACT",
      description: "Mines Act",
      project_summary_authorization_type_group_id: null,
    },
    {
      project_summary_authorization_type: "ENVIRONMENTAL_MANAGMENT_ACT",
      description: "Environmental Management Act",
      project_summary_authorization_type_group_id: null,
    },
    {
      project_summary_authorization_type: "WATER_SUSTAINABILITY_ACT",
      description: "Water Sustainability Act",
      project_summary_authorization_type_group_id: null,
    },
    {
      project_summary_authorization_type: "FORESTRY_ACT",
      description: "Forestry Act",
      project_summary_authorization_type_group_id: null,
    },
    {
      project_summary_authorization_type: "OTHER_LEGISLATION",
      description: "Other legislation",
      project_summary_authorization_type_group_id: null,
    },
    {
      project_summary_authorization_type: "MINES_ACT_PERMIT",
      description: "Mines Act permit",
      project_summary_authorization_type_group_id: "MINES_ACT",
    },
    {
      project_summary_authorization_type: "AIR_EMISSIONS_DISCHARGE_PERMIT",
      description: "Air emissions discharge permit",
      project_summary_authorization_type_group_id: "ENVIRONMENTAL_MANAGMENT_ACT",
    },
    {
      project_summary_authorization_type: "EFFLUENT_DISCHARGE_PERMIT",
      description: "Effluent discharge permit",
      project_summary_authorization_type_group_id: "ENVIRONMENTAL_MANAGMENT_ACT",
    },
    {
      project_summary_authorization_type: "REFUSE_DISCHARGE_PERMIT",
      description: "Refuse discharge permit",
      project_summary_authorization_type_group_id: "ENVIRONMENTAL_MANAGMENT_ACT",
    },
    {
      project_summary_authorization_type: "MUNICIPAL_WASTEWATER_REGULATION",
      description: "Municipal wastewater regulation",
      project_summary_authorization_type_group_id: "ENVIRONMENTAL_MANAGMENT_ACT",
    },
    {
      project_summary_authorization_type: "CHANGE_APPROVAL",
      description: "Change approval",
      project_summary_authorization_type_group_id: "WATER_SUSTAINABILITY_ACT",
    },
    {
      project_summary_authorization_type: "USE_APPROVAL",
      description: "Use approval",
      project_summary_authorization_type_group_id: "WATER_SUSTAINABILITY_ACT",
    },
    {
      project_summary_authorization_type: "WATER_LICENCE",
      description: "Water licence",
      project_summary_authorization_type_group_id: "WATER_SUSTAINABILITY_ACT",
    },
    {
      project_summary_authorization_type: "OCCUPANT_CUT_LICENCE",
      description: "Occupant licence to cut",
      project_summary_authorization_type_group_id: "FORESTRY_ACT",
    },
    {
      project_summary_authorization_type: "OTHER",
      description: "Other legislation",
      project_summary_authorization_type_group_id: "OTHER_LEGISLATION",
    },
  ],
  projectSummaryPermitTypes: [
    {
      project_summary_permit_type: "NEW",
      description: "New",
    },
    {
      project_summary_permit_type: "AMENDMENT",
      description: "Amendment to an existing permit",
    },
    {
      project_summary_permit_type: "NOTIFICATION",
      description: "Notification",
    },
    {
      project_summary_permit_type: "CLOSURE",
      description: "Closure of an existing permit",
    },
    {
      project_summary_permit_type: "OTHER",
      description: "Other",
    },
  ],
};

export const MINE_REPORT_SUBMISSIONS = [
  {
    mine_report_guid: "9ac75a07-7232-4f42-8c91-d43008dac91a",
    mine_report_id: 53,
    mine_report_submission_guid: "ed597cd0-5ccd-458f-87e2-d7f665b6b1db",
    submission_date: "2024-02-07",
    mine_report_submission_status_code: "REQ",
    documents: [
      {
        mine_document_guid: "176ccc2e-f1fa-4ca2-a904-41d1a81d74fa",
        mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
        document_manager_guid: "519ab034-9ad1-48b2-9969-4e39c8b68198",
        document_name: "document.pdf",
        upload_date: "2024-02-06 21:05:40.315908+00:00",
        update_timestamp: "2024-02-06 21:05:40.315906+00:00",
        create_user: "test@bceid",
        is_archived: false,
        archived_date: null,
        archived_by: null,
        versions: [],
      },
    ],
    comments: [],
    report_type: "CRR",
    mine_report_definition_guid:
      BULK_STATIC_CONTENT_RESPONSE.mineReportDefinitionOptions[0].mine_report_definition_guid,
    mine_report_category: ["H&S"],
    report_name: BULK_STATIC_CONTENT_RESPONSE.mineReportDefinitionOptions[0].report_name,
    due_date: "2024-02-07",
    received_date: "2024-02-06",
    submission_year: 2024,
    create_user: "test@bceid",
    create_timestamp: "2024-02-07T19:15:38.505462+00:00",
    update_user: "idir\\test",
    update_timestamp: "2024-02-07T19:15:38.505482+00:00",
    permit_guid: null,
    permit_number: null,
    mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
    mine_name: "Mine Name",
    permit_condition_category_code: null,
    description_comment: "This is the description comment field",
    submitter_name: "Susan Strong",
    submitter_email: "susan@strong.com",
    mine_report_contacts: [],
  },
  {
    mine_report_guid: "9c7e33b2-92f0-4d57-8b40-0cd3c6e5506a",
    mine_report_id: 54,
    mine_report_submission_guid: "063ad639-d74a-4a6a-a499-980e0e0478fc",
    submission_date: "2024-02-07",
    mine_report_submission_status_code: "INI",
    documents: [
      {
        mine_document_guid: "cdb43e9c-ad56-4839-97ac-658b1e50c132",
        mine_guid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
        document_manager_guid: "08fbb3e3-c1b2-4e9f-94e6-84a9a077125f",
        document_name: "document.pdf",
        upload_date: "2024-02-06 21:05:40.315908+00:00",
        update_timestamp: "2024-02-06 21:05:40.315906+00:00",
        create_user: "test@bceid",
        is_archived: false,
        archived_date: null,
        archived_by: null,
        versions: [],
      },
    ],
    comments: [
      {
        mine_report_comment_guid: "2afa052e-1d52-4a25-bb3d-6e3c4e75e683",
        report_comment:
          "Population ability especially especially list or receive. Management never rise save guess involve it.",
        comment_visibility_ind: true,
        comment_user: "system",
        comment_datetime: "2023-04-17T20:50:20.812666+00:00",
      },
    ],
    report_type: "PRR",
    mine_report_definition_guid: null,
    mine_report_category: null,
    report_name: "General Conditions",
    due_date: "2024-02-07",
    received_date: "2024-02-06",
    submission_year: 2024,
    create_user: "test@bceid",
    create_timestamp: "2024-02-07T19:15:38.505462+00:00",
    update_user: "idir\\test",
    update_timestamp: "2024-02-07T19:15:38.505482+00:00",
    permit_guid: "1628847c-060b-45f2-990f-815877174801",
    permit_number: "C-12345",
    mine_guid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
    mine_name: "Mine Name",
    permit_condition_category_code: "GEC",
    description_comment: "This is the description comment field",
    submitter_name: "Susan Strong",
    submitter_email: "susan@strong.com",
    mine_report_contacts: [],
  },
];

export const MINE_REPORTS = [
  {
    mine_report_id: 123,
    mine_report_guid: "9f98a719-720a-40a5-ac5b-e91e8a526fad",
    mine_report_definition_guid: "baa01f9f-c9b2-485d-96f3-12a9c8fe637b",
    mine_report_category: ["GSC", "GTC"],
    report_name: "Underground Oil and Grease Storage Area Report",
    due_date: "2020-01-02",
    submission_year: 2020,
    mine_report_status_code: "NRQ",
    created_by_idir: "idir\\TEST",
    permit_guid: null,
    latest_submission: {
      mine_report_submission_guid: "fed32646-5db7-495a-acbb-b6b8ad333ee1",
      submission_date: "2020-01-29",
      mine_report_submission_status_code: "NRQ",
      received_date: "2020-01-10",
      documents: [
        {
          mine_document_guid: "98a9d9de-4feb-41a7-adda-842421462657",
          mine_guid: "abed555d-7391-49e7-bc04-e2c6062432c6",
          document_manager_guid: "b660371a-d3fa-41ff-99ed-f9b86dff72f7",
          document_name: "0101581201901_APPLICATION_FORM (3) (2) (1).pdf",
          upload_date: "2020-01-29T20:50:51.439631+00:00",
        },
      ],
      comments: [],
    },
    create_user: "test@bceid",
    create_timestamp: "2024-02-07T19:15:38.505462+00:00",
    update_user: "idir\\test",
    update_timestamp: "2024-02-07T19:15:38.505482+00:00",
    mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
    mine_name: "Abbott Inc",
  },
  {
    mine_report_id: 124,
    mine_report_guid: "b59a166e-749e-4e6c-a232-d4c55f1f227c",
    mine_report_definition_guid: "5f4f4727-4ecd-4a04-8929-2e8a5e03996d",
    mine_report_category: ["GTC", "TSF"],
    report_name: "TSF, WSF or Dam As-built Report",
    due_date: "2020-03-31",
    submission_year: 2020,
    mine_report_status_code: "NRQ",
    created_by_idir: "idir\\TEST",
    permit_guid: null,
    latest_submission: {
      mine_report_submission_guid: "d0149d1b-845d-4011-a731-3f951c7d8219",
      submission_date: "2020-01-29",
      mine_report_submission_status_code: "NRQ",
      received_date: "2020-01-02",
      documents: [
        {
          mine_document_guid: "3d4e420f-3f0a-4c54-ad07-e3aeb74cbe89",
          mine_guid: "abed555d-7391-49e7-bc04-e2c6062432c6",
          document_manager_guid: "dde0b5bf-a14d-4272-8a65-467440b01294",
          document_name: "0101581201901_APPLICATION_FORM (1) (1).pdf",
          upload_date: "2020-01-29T20:51:53.466101+00:00",
        },
      ],
      comments: [],
    },
    create_user: "test@bceid",
    create_timestamp: "2024-02-07T19:15:38.505462+00:00",
    update_user: "idir\\test",
    update_timestamp: "2024-02-07T19:15:38.505482+00:00",
    mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
    mine_name: "Abbott Inc",
  },
  {
    mine_report_id: 125,
    mine_report_guid: "92327cd3-eec0-4e18-b898-25539ac408e9",
    mine_report_definition_guid: "6eda0c36-8748-4072-83c9-0fcdf270d36f",
    mine_report_category: ["GTC", "TSF"],
    report_name: "Annual DSI",
    due_date: "2020-03-31",
    received_date: null,
    submission_year: 2020,
    created_by_idir: "idir\\TEST",
    permit_guid: null,
    latest_submission: {},
    mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
    create_user: "test@bceid",
    create_timestamp: "2024-02-07T19:15:38.505462+00:00",
    update_user: "idir\\test",
    update_timestamp: "2024-02-07T19:15:38.505482+00:00",
    mine_name: "Abbott Inc",
    mine_report_status_code: "NON",
  },
];

export const MINE_REPORT_RESPONSE = {
  records: MINE_REPORTS,
};

export const REPORTS_PAGE_DATA = {
  records: [MINE_REPORTS],
  current_page: 1,
  items_per_page: 25,
  total: 25,
  total_pages: 1,
};

export const MINE_REPORT_DEFINITION_HASH = {
  "a1f02190-908b-4459-9dfe-6382282dfd30": {
    mine_report_definition_guid: "a1f02190-908b-4459-9dfe-6382282dfd30",
    report_name: "OHSC Annual Report",
    description: "",
    due_date_period_months: 12,
    mine_report_due_date_type: "FIS",
    default_due_date: "2020-03-31",
    categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
    compliance_articles: [
      {
        compliance_article_id: 114,
        article_act_code: "HSRCM",
        section: "1",
        sub_section: "9",
        paragraph: "3",
        sub_paragraph: null,
        description: "General",
        long_description: "General",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "1f4dac68-2131-4b12-9cdd-9e2bb86e50a2": {
    mine_report_definition_guid: "1f4dac68-2131-4b12-9cdd-9e2bb86e50a2",
    report_name: "Right to Refuse Report",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "EVT",
    default_due_date: null,
    categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
    compliance_articles: [
      {
        compliance_article_id: 59,
        article_act_code: "HSRCM",
        section: "1",
        sub_section: "10",
        paragraph: "7",
        sub_paragraph: null,
        description: "Manager Investigates",
        long_description: "Manager Investigates",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "f650d2b6-96e4-43f0-9d15-6fbead2d5978": {
    mine_report_definition_guid: "f650d2b6-96e4-43f0-9d15-6fbead2d5978",
    report_name: "Report of MERP Test",
    description: "",
    due_date_period_months: 12,
    mine_report_due_date_type: "FIS",
    default_due_date: "2020-03-31",
    categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
    compliance_articles: [
      {
        compliance_article_id: 370,
        article_act_code: "HSRCM",
        section: "3",
        sub_section: "7",
        paragraph: "1",
        sub_paragraph: null,
        description: "Mine Emergency Response Plan",
        long_description: "Mine Emergency Response Plan",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "c9baac63-1578-47eb-847d-a992e0aeba67": {
    mine_report_definition_guid: "c9baac63-1578-47eb-847d-a992e0aeba67",
    report_name: "Underground Fueling Station Report",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "PMT",
    default_due_date: null,
    categories: [
      { mine_report_category: "GSE", description: "Geoscience and Environmental" },
      { mine_report_category: "GTC", description: "Geotechnical" },
    ],
    compliance_articles: [
      {
        compliance_article_id: 510,
        article_act_code: "HSRCM",
        section: "4",
        sub_section: "3",
        paragraph: "3",
        sub_paragraph: null,
        description: "Underground Fuelling Stations",
        long_description: "Underground Fuelling Stations",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "f5dec476-cb13-430a-a85e-81e5bbe666e4": {
    mine_report_definition_guid: "f5dec476-cb13-430a-a85e-81e5bbe666e4",
    report_name: "Underground Oil and Grease Storage Area Report",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "PMT",
    default_due_date: null,
    categories: [
      { mine_report_category: "GSE", description: "Geoscience and Environmental" },
      { mine_report_category: "GTC", description: "Geotechnical" },
    ],
    compliance_articles: [
      {
        compliance_article_id: 511,
        article_act_code: "HSRCM",
        section: "4",
        sub_section: "3",
        paragraph: "4",
        sub_paragraph: null,
        description: "Underground Oil and Grease Storage Areas",
        long_description: "Underground Oil and Grease Storage Areas",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "ec11deae-1187-42e7-a13c-17a25743448f": {
    mine_report_definition_guid: "ec11deae-1187-42e7-a13c-17a25743448f",
    report_name: "Flammable Gas Report",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "EVT",
    default_due_date: null,
    categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
    compliance_articles: [
      {
        compliance_article_id: 702,
        article_act_code: "HSRCM",
        section: "6",
        sub_section: "42",
        paragraph: "3",
        sub_paragraph: null,
        description: "Reporting",
        long_description: "Reporting",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "e2f72b23-d7d9-4a11-9139-e86b3c6f4bc4": {
    mine_report_definition_guid: "e2f72b23-d7d9-4a11-9139-e86b3c6f4bc4",
    report_name: "Free Fall Tests Report",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "EVT",
    default_due_date: null,
    categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
    compliance_articles: [
      {
        compliance_article_id: 793,
        article_act_code: "HSRCM",
        section: "7",
        sub_section: "5",
        paragraph: "13",
        sub_paragraph: null,
        description: "Free Fall Tests - Report",
        long_description: "Free Fall Tests - Report",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "b820a0e0-1d0c-4460-8787-c813484742c6": {
    mine_report_definition_guid: "b820a0e0-1d0c-4460-8787-c813484742c6",
    report_name: "Defective Explosives Report",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "EVT",
    default_due_date: null,
    categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
    compliance_articles: [
      {
        compliance_article_id: 909,
        article_act_code: "HSRCM",
        section: "8",
        sub_section: "3",
        paragraph: "4",
        sub_paragraph: null,
        description: "Defective Explosives",
        long_description: "Defective Explosives",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "82abcaf9-e432-423d-b110-73acbfa9c94f": {
    mine_report_definition_guid: "82abcaf9-e432-423d-b110-73acbfa9c94f",
    report_name: "Careless Acts Report",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "EVT",
    default_due_date: null,
    categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
    compliance_articles: [
      {
        compliance_article_id: 914,
        article_act_code: "HSRCM",
        section: "8",
        sub_section: "3",
        paragraph: "9",
        sub_paragraph: null,
        description: "Careless Acts",
        long_description: "Careless Acts",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "d7f7b95c-4f60-4125-8f8c-f843d1be462e": {
    mine_report_definition_guid: "d7f7b95c-4f60-4125-8f8c-f843d1be462e",
    report_name: "Drilling Precaution Procedures Report",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "PMT",
    default_due_date: null,
    categories: [{ mine_report_category: "H&S", description: "Health and Safety" }],
    compliance_articles: [
      {
        compliance_article_id: 955,
        article_act_code: "HSRCM",
        section: "8",
        sub_section: "7",
        paragraph: "2",
        sub_paragraph: null,
        description: "Misfired Holes and Bootlegs - Drilling Precautions",
        long_description: "Misfired Holes and Bootlegs - Drilling Precautions",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "61b87acf-8604-4975-8172-282bbf2b59fc": {
    mine_report_definition_guid: "61b87acf-8604-4975-8172-282bbf2b59fc",
    report_name: "Annual Summary of Exploration Activities",
    description: "",
    due_date_period_months: 12,
    mine_report_due_date_type: "FIS",
    default_due_date: "2020-03-31",
    categories: [
      { mine_report_category: "H&S", description: "Health and Safety" },
      { mine_report_category: "GSE", description: "Geoscience and Environmental" },
      { mine_report_category: "GTC", description: "Geotechnical" },
    ],
    compliance_articles: [
      {
        compliance_article_id: 969,
        article_act_code: "HSRCM",
        section: "9",
        sub_section: "2",
        paragraph: "1",
        sub_paragraph: null,
        description: "Notice Requirements",
        long_description: "Notice Requirements",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "ba6f37df-5ced-4664-9a5e-5a5e93a09748": {
    mine_report_definition_guid: "ba6f37df-5ced-4664-9a5e-5a5e93a09748",
    report_name: "Management Plan for Riparian Area",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "PMT",
    default_due_date: null,
    categories: [{ mine_report_category: "GSE", description: "Geoscience and Environmental" }],
    compliance_articles: [
      {
        compliance_article_id: 978,
        article_act_code: "HSRCM",
        section: "9",
        sub_section: "5",
        paragraph: "1",
        sub_paragraph: null,
        description: "Riparian Setback Distances",
        long_description: "Riparian Setback Distances",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
  "c387b2a2-7bf4-4a29-9e9a-faa38a838b2d": {
    mine_report_definition_guid: "c387b2a2-7bf4-4a29-9e9a-faa38a838b2d",
    report_name: "Terrain Stability Remediation Plan",
    description: "",
    due_date_period_months: null,
    mine_report_due_date_type: "EVT",
    default_due_date: null,
    categories: [
      { mine_report_category: "GSE", description: "Geoscience and Environmental" },
      { mine_report_category: "H&S", description: "Health and Safety" },
    ],
    compliance_articles: [
      {
        compliance_article_id: 980,
        article_act_code: "HSRCM",
        section: "9",
        sub_section: "7",
        paragraph: "1",
        sub_paragraph: null,
        description: "Terrain",
        long_description: "Terrain",
        effective_date: "1970-01-01",
        expiry_date: "9999-12-31",
      },
    ],
  },
};

export const DROPDOWN_BOND_TYPE_OPTIONS = [
  { value: "BDA", label: "Bank Draft", subType: null, isActive: true },
  { value: "CAS", label: "Cash", subType: null, isActive: true },
  { value: "CEC", label: "Certified Cheque", subType: null, isActive: true },
  { value: "ILC", label: "Irrevocable Letter of Credit", subType: null, isActive: true },
  { value: "MOR", label: "Money Order", subType: null, isActive: true },
  { value: "SAG", label: "Safekeeping Agreement", subType: null, isActive: true },
  { value: "SBO", label: "Surety Bond", subType: null, isActive: true },
];

export const BOND_TYPE_OPTIONS_HASH = {
  CEC: "Certified Cheque",
  CAS: "Cash",
  ILC: "Irrevocable Letter of Credit",
  MOR: "Money Order",
  BDA: "Bank Draft",
  SBO: "Surety Bond",
  SAG: "Safekeeping Agreement",
};

export const DROPDOWN_BOND_STATUS_OPTIONS = [
  { value: "ACT", label: "Active", subType: null, isActive: true },
  { value: "CON", label: "Confiscated", subType: null, isActive: true },
  { value: "REL", label: "Released", subType: null, isActive: true },
];

export const BOND_STATUS_OPTIONS_HASH = {
  REL: "Released",
  CON: "Confiscated",
  ACT: "Active",
};

export const DROPDOWN_BOND_DOCUMENT_TYPE_OPTIONS = [
  { value: "AKL", label: "Acknowledgement Letter", subType: null, isActive: true },
  { value: "CSF", label: "Confiscation of Security Form", subType: null, isActive: true },
  { value: "CSL", label: "Confiscation of Security Letter", subType: null, isActive: true },
  { value: "RSF", label: "Release of Security Form", subType: null, isActive: true },
  { value: "RSL", label: "Release of Security Letter", subType: null, isActive: true },
  { value: "REL", label: "Reminder Letter", subType: null, isActive: true },
  { value: "SRB", label: "Scan of Reclamation Security Bond", subType: null, isActive: true },
];

export const BOND_DOCUMENT_TYPE_OPTIONS_HASH = {
  AKL: "Acknowledgement Letter",
  REL: "Reminder Letter",
  CSL: "Confiscation of Security Letter",
  CSF: "Confiscation of Security Form",
  RSL: "Release of Security Letter",
  RSF: "Release of Security Form",
  SRB: "Scan of Reclamation Security Bond",
};

export const BONDS = {
  records: [
    {
      bond_id: 1,
      bond_guid: "erjvnaqekrj",
      amount: 300,
      bond_type_code: "CAS",
      payer_party_guid: "sethwrt",
      bond_status_code: "ACT",
      reference_number: "",
      issue_date: "2018-10-16",
      institution_name: null,
      institution_street: null,
      institution_city: null,
      institution_province: null,
      institution_postal_code: null,
      note: null,
      payer: {},
      permit_guid: "1628847c-060b-45f2-990f-815877174801",
      documents: [],
    },
    {
      bond_id: 1,
      bond_guid: "erjvnaqekrj",
      amount: 900,
      bond_type_code: "CAS",
      payer_party_guid: "sethwrt",
      bond_status_code: "ACT",
      reference_number: "",
      issue_date: "2018-10-16",
      institution_name: null,
      institution_street: null,
      institution_city: null,
      institution_province: null,
      institution_postal_code: null,
      note: null,
      payer: {},
      permit_guid: "1628847c-060b-45f2-990f-815877174801",
      documents: [],
    },
    {
      bond_id: 1,
      bond_guid: "erjvnaqekrj",
      amount: 1000,
      bond_type_code: "CAS",
      payer_party_guid: "sethwrt",
      bond_status_code: "CON",
      reference_number: "",
      issue_date: "2018-10-16",
      institution_name: null,
      institution_street: null,
      institution_city: null,
      institution_province: null,
      institution_postal_code: null,
      note: null,
      payer: {},
      permit_guid: "1628847c-060b-45f2-990f-815877174801",
      documents: [],
    },
  ],
};

export const BOND_TOTALS = {
  amountHeld: 1200,
  count: 2,
};

export const BOND_RESPONSE = { records: BONDS };

export const RECLAMATION_INVOICES = {
  records: [
    {
      project_id: "3523461",
      permit_guid: "1628847c-060b-45f2-990f-815877174801",
      amount: 1251,
      vendor: "John Doe",
    },
    {
      project_id: "35434461",
      permit_guid: "1628847c-060b-45f2-990f-815877174801",
      amount: 200,
      vendor: "John Peterson",
    },
  ],
};

export const MINE_COMMENTS = {
  records: [
    {
      mine_comment_guid: "245234634153",
      comment_user: "mockUser",
      mine_comment: "new comment",
      comment_datetime: "2018-10-16",
    },
    {
      mine_comment_guid: "356135",
      comment_user: "mockUser",
      mine_comment: "new comment again",
      comment_datetime: "2018-10-16",
    },
  ],
};

export const MINE_ALERTS = {
  records: [
    {
      mine_alert_guid: "3a31287c-82a3-46f0-a973-7a8a399718ad",
      start_date: "2022-10-27",
      end_date: "2022-10-31",
      contact_name: "mock name",
      contact_phone: "337-588-3109",
      message: "Mine under construction",
    },
  ],
};

export const ORGBOOK_SEARCH_RESULTS = [
  {
    id: 777855,
    names: [
      {
        id: 712594,
        text: "ZINEX MINING CORP.",
        language: null,
        credential_id: 777855,
        type: "entity_name",
      },
    ],
    inactive: false,
  },
];

export const ORGBOOK_CREDENTIAL = {
  id: 777855,
  create_timestamp: "2019-06-25T23:01:10.740961-07:00",
  effective_date: "2006-11-10T14:18:19-08:00",
  inactive: false,
  latest: true,
  revoked: false,
  revoked_date: null,
  wallet_id: "92101ca6-1c55-4078-8146-855a1afb613c",
  credential_type: {
    id: 1,
    issuer: {
      id: 1,
      has_logo: true,
      create_timestamp: "2019-06-25T14:52:20.353243-07:00",
      update_timestamp: "2020-05-06T12:02:01.492888-07:00",
      did: "HR6vs6GEZ8rHaVgjg2WodM",
      name: "BC Corporate Registry",
      abbreviation: "BCReg",
      email: "bcregistries@gov.bc.ca",
      url:
        "https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/citizens-services/bc-registries-online-services",
      endpoint: null,
    },
    has_logo: true,
    create_timestamp: "2019-06-25T14:52:20.428303-07:00",
    update_timestamp: "2020-05-06T12:30:45.967845-07:00",
    description: "Registration",
    credential_def_id: "HR6vs6GEZ8rHaVgjg2WodM:3:CL:41051:tag",
    last_issue_date: "2020-05-06T12:30:45.967739-07:00",
    url:
      "https://bcreg-x-proxy-devex-von-bc-registries-agent-prod.pathfinder.gov.bc.ca/bcreg/incorporation",
    schema: {
      id: 1,
      create_timestamp: "2019-06-25T14:52:20.397843-07:00",
      update_timestamp: "2020-05-06T12:02:01.516616-07:00",
      name: "registration.registries.ca",
      version: "1.0.42",
      origin_did: "HR6vs6GEZ8rHaVgjg2WodM",
    },
  },
  addresses: [],
  attributes: [
    {
      id: 5381558,
      type: "registration_date",
      format: "datetime",
      value: "2006-11-10T22:18:19+00:00",
      credential_id: 777855,
    },
    {
      id: 5381559,
      type: "entity_name_effective",
      format: "datetime",
      value: "2006-11-10T22:18:19+00:00",
      credential_id: 777855,
    },
    { id: 5381560, type: "entity_status", format: "category", value: "ACT", credential_id: 777855 },
    {
      id: 5381561,
      type: "entity_status_effective",
      format: "datetime",
      value: "2006-11-10T22:18:19+00:00",
      credential_id: 777855,
    },
    { id: 5381562, type: "entity_type", format: "category", value: "BC", credential_id: 777855 },
    {
      id: 5381563,
      type: "home_jurisdiction",
      format: "jurisdiction",
      value: "BC",
      credential_id: 777855,
    },
    {
      id: 5381564,
      type: "reason_description",
      format: "category",
      value: "Filing:ICORP",
      credential_id: 777855,
    },
  ],
  names: [
    {
      id: 712594,
      text: "ZINEX MINING CORP.",
      language: null,
      credential_id: 777855,
      type: "entity_name",
    },
  ],
  local_name: {
    id: 712594,
    text: "ZINEX MINING CORP.",
    language: null,
    credential_id: 777855,
    type: "entity_name",
  },
  remote_name: null,
  topic: {
    id: 683004,
    create_timestamp: "2019-06-25T23:01:10.721202-07:00",
    update_timestamp: "2019-06-25T23:01:10.721249-07:00",
    source_id: "BC0774378",
    type: "registration",
    names: [
      {
        id: 712594,
        text: "ZINEX MINING CORP.",
        language: null,
        credential_id: 777855,
        type: "entity_name",
      },
    ],
    local_name: {
      id: 712594,
      text: "ZINEX MINING CORP.",
      language: null,
      credential_id: 777855,
      type: "entity_name",
    },
    remote_name: null,
    addresses: [],
    attributes: [
      {
        id: 5381558,
        type: "registration_date",
        format: "datetime",
        value: "2006-11-10T22:18:19+00:00",
        credential_id: 777855,
        credential_type_id: 1,
      },
      {
        id: 5381559,
        type: "entity_name_effective",
        format: "datetime",
        value: "2006-11-10T22:18:19+00:00",
        credential_id: 777855,
        credential_type_id: 1,
      },
      {
        id: 5381560,
        type: "entity_status",
        format: "category",
        value: "ACT",
        credential_id: 777855,
        credential_type_id: 1,
      },
      {
        id: 5381561,
        type: "entity_status_effective",
        format: "datetime",
        value: "2006-11-10T22:18:19+00:00",
        credential_id: 777855,
        credential_type_id: 1,
      },
      {
        id: 5381562,
        type: "entity_type",
        format: "category",
        value: "BC",
        credential_id: 777855,
        credential_type_id: 1,
      },
      {
        id: 5381563,
        type: "home_jurisdiction",
        format: "jurisdiction",
        value: "BC",
        credential_id: 777855,
        credential_type_id: 1,
      },
      {
        id: 5381564,
        type: "reason_description",
        format: "category",
        value: "Filing:ICORP",
        credential_id: 777855,
        credential_type_id: 1,
      },
    ],
  },
  related_topics: [],
  credential_set: {
    id: 708701,
    create_timestamp: "2019-06-25T23:01:10.780834-07:00",
    update_timestamp: "2019-06-25T23:01:10.780864-07:00",
    latest_credential_id: 777855,
    topic_id: 683004,
    first_effective_date: "2006-11-10T14:18:19-08:00",
    last_effective_date: null,
    credentials: [
      {
        id: 777855,
        create_timestamp: "2019-06-25T23:01:10.740961-07:00",
        effective_date: "2006-11-10T14:18:19-08:00",
        inactive: false,
        latest: true,
        revoked: false,
        revoked_date: null,
        wallet_id: "92101ca6-1c55-4078-8146-855a1afb613c",
        credential_type: {
          id: 1,
          issuer: {
            id: 1,
            has_logo: true,
            create_timestamp: "2019-06-25T14:52:20.353243-07:00",
            update_timestamp: "2020-05-06T12:02:01.492888-07:00",
            did: "HR6vs6GEZ8rHaVgjg2WodM",
            name: "BC Corporate Registry",
            abbreviation: "BCReg",
            email: "bcregistries@gov.bc.ca",
            url:
              "https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/citizens-services/bc-registries-online-services",
            endpoint: null,
          },
          has_logo: true,
          create_timestamp: "2019-06-25T14:52:20.428303-07:00",
          update_timestamp: "2020-05-06T12:30:45.967845-07:00",
          description: "Registration",
          credential_def_id: "HR6vs6GEZ8rHaVgjg2WodM:3:CL:41051:tag",
          last_issue_date: "2020-05-06T12:30:45.967739-07:00",
          url:
            "https://bcreg-x-proxy-devex-von-bc-registries-agent-prod.pathfinder.gov.bc.ca/bcreg/incorporation",
          schema: {
            id: 1,
            create_timestamp: "2019-06-25T14:52:20.397843-07:00",
            update_timestamp: "2020-05-06T12:02:01.516616-07:00",
            name: "registration.registries.ca",
            version: "1.0.42",
            origin_did: "HR6vs6GEZ8rHaVgjg2WodM",
          },
        },
        addresses: [],
        attributes: [
          {
            id: 5381558,
            type: "registration_date",
            format: "datetime",
            value: "2006-11-10T22:18:19+00:00",
            credential_id: 777855,
          },
          {
            id: 5381559,
            type: "entity_name_effective",
            format: "datetime",
            value: "2006-11-10T22:18:19+00:00",
            credential_id: 777855,
          },
          {
            id: 5381560,
            type: "entity_status",
            format: "category",
            value: "ACT",
            credential_id: 777855,
          },
          {
            id: 5381561,
            type: "entity_status_effective",
            format: "datetime",
            value: "2006-11-10T22:18:19+00:00",
            credential_id: 777855,
          },
          {
            id: 5381562,
            type: "entity_type",
            format: "category",
            value: "BC",
            credential_id: 777855,
          },
          {
            id: 5381563,
            type: "home_jurisdiction",
            format: "jurisdiction",
            value: "BC",
            credential_id: 777855,
          },
          {
            id: 5381564,
            type: "reason_description",
            format: "category",
            value: "Filing:ICORP",
            credential_id: 777855,
          },
        ],
        names: [
          {
            id: 712594,
            text: "ZINEX MINING CORP.",
            language: null,
            credential_id: 777855,
            type: "entity_name",
          },
        ],
        local_name: {
          id: 712594,
          text: "ZINEX MINING CORP.",
          language: null,
          credential_id: 777855,
          type: "entity_name",
        },
        remote_name: null,
        topic: {
          id: 683004,
          create_timestamp: "2019-06-25T23:01:10.721202-07:00",
          update_timestamp: "2019-06-25T23:01:10.721249-07:00",
          source_id: "BC0774378",
          type: "registration",
          names: [
            {
              id: 712594,
              text: "ZINEX MINING CORP.",
              language: null,
              credential_id: 777855,
              type: "entity_name",
            },
          ],
          local_name: {
            id: 712594,
            text: "ZINEX MINING CORP.",
            language: null,
            credential_id: 777855,
            type: "entity_name",
          },
          remote_name: null,
          addresses: [],
          attributes: [
            {
              id: 5381558,
              type: "registration_date",
              format: "datetime",
              value: "2006-11-10T22:18:19+00:00",
              credential_id: 777855,
              credential_type_id: 1,
            },
            {
              id: 5381559,
              type: "entity_name_effective",
              format: "datetime",
              value: "2006-11-10T22:18:19+00:00",
              credential_id: 777855,
              credential_type_id: 1,
            },
            {
              id: 5381560,
              type: "entity_status",
              format: "category",
              value: "ACT",
              credential_id: 777855,
              credential_type_id: 1,
            },
            {
              id: 5381561,
              type: "entity_status_effective",
              format: "datetime",
              value: "2006-11-10T22:18:19+00:00",
              credential_id: 777855,
              credential_type_id: 1,
            },
            {
              id: 5381562,
              type: "entity_type",
              format: "category",
              value: "BC",
              credential_id: 777855,
              credential_type_id: 1,
            },
            {
              id: 5381563,
              type: "home_jurisdiction",
              format: "jurisdiction",
              value: "BC",
              credential_id: 777855,
              credential_type_id: 1,
            },
            {
              id: 5381564,
              type: "reason_description",
              format: "category",
              value: "Filing:ICORP",
              credential_id: 777855,
              credential_type_id: 1,
            },
          ],
        },
        related_topics: [],
      },
    ],
  },
};

export const CONSEQUENCE_CLASSIFICATION_STATUS_DROPDOWN_OPTIONS = [
  { value: "LOW", label: "Low", subType: null, isActive: true },
  { value: "SIG", label: "Significant", subType: null, isActive: true },
  { value: "HIG", label: "High", subType: null, isActive: true },
  { value: "VHIG", label: "Very High", subType: null, isActive: true },
  { value: "EXT", label: "Extreme", subType: null, isActive: true },
  { value: "NRT", label: "Not Rated", subType: null, isActive: true },
];

export const ITRB_EXEMPTION_STATUS_DROPDOWN_OPTIONS = [
  { value: "EXEM", label: "Exemption", subType: null, isActive: true },
  { value: "NO", label: "No", subType: null, isActive: true },
  { value: "YES", label: "Yes", subType: null, isActive: true },
];

export const CONSEQUENCE_CLASSIFICATION_STATUS_HASH = {
  EXT: "Extreme",
  VHIG: "Very High",
  HIG: "High",
  SIG: "Significant",
  LOW: "Low",
  NRT: "Not Rated",
};

export const ITRB_EXEMPTION_STATUS_HASH = {
  YES: "Yes",
  NO: "No",
  EXEM: "Exemption",
};

export const TSF_OPERATING_STATUS_DROPDOWN_OPTIONS = [
  { value: "CLO", label: "Closed", subType: null, isActive: true },
  { value: "CAM", label: "Inactive (C&M)", subType: null, isActive: true },
  { value: "OPT", label: "Operating", subType: null, isActive: true },
];

export const TSF_OPERATING_STATUS_HASH = {
  OPT: "Operating",
  CLO: "Closed",
  CAM: "Inactive (C&M)",
};

export const EXPLOSIVES_PERMIT_DOCUMENT_OPTIONS = [
  { value: "BLA", label: "Blasting Plan", subType: null, isActive: true },
  { value: "PER", label: "Explosives Storage and Use Permit", subType: null, isActive: true },
  {
    value: "LET",
    label: "Explosives Storage and Use Permit Letter",
    subType: null,
    isActive: true,
  },
];

export const EXPLOSIVES_PERMIT_DOCUMENT_OPTIONS_HASH = {
  PER: "Explosives Storage and Use Permit",
  LET: "Explosives Storage and Use Permit Letter",
  BLA: "Blasting Plan",
};

export const EXPLOSIVES_PERMIT_STATUS_OPTIONS = [
  { value: "APP", label: "Approved", subType: null, isActive: true },
  {
    value: "REC",
    label: "Received",
    subType: null,
    isActive: true,
  },
  { value: "REJ", label: "Rejected", subType: null, isActive: true },
  {
    value: "WIT",
    label: "Withdrawn",
    subType: null,
    isActive: true,
  },
];

export const EXPLOSIVES_PERMIT_STATUS_OPTIONS_HASH = {
  APP: "Approved",
  REJ: "Rejected",
  WIT: "Withdrawn",
  REC: "Received",
};

export const EXPLOSIVES_PERMIT_MAGAZINE_OPTIONS = [
  {
    value: "DET",
    label: "Detonator Magazine",
    subType: null,
    isActive: true,
  },
  { value: "EXP", label: "Explosives Magazine", subType: null, isActive: true },
];

export const EXPLOSIVES_PERMIT_MAGAZINE_OPTIONS_HASH = {
  EXP: "Explosives Magazine",
  DET: "Detonator Magazine",
};

const esupRecords: Partial<IExplosivesPermit>[] = [
  {
    amendment_count: 0,
    amendment_no: 0,
    isAmendment: false,
    explosives_permit_id: 1,
    explosives_permit_guid: "816459817365978135",
    permit_number: "BC-11111",
    mines_permit_number: "P-39039404",
    now_number: "1500615-2021-12",
    issuing_inspector_name: "John",
    issuing_inspector_party_guid: null,
    originating_system: "Core",
    permittee_name: "Mike",
    permittee_mine_party_appt_id: 0,
    application_number: "52135425",
    application_date: "2007-12-04",
    issue_date: "2007-12-04",
    expiry_date: "2007-12-04",
    latitude: null,
    longitude: null,
    application_status: "APP",
    explosives_permit_amendments: [],
    documents: [],
    detonator_magazines: [
      {
        detonator_type: "text field",
        explosives_permit_magazine_id: 1,
        explosives_permit_id: 1,
        explosives_permit_magazine_type_code: "DET",
        type_no: "1",
        tag_no: "1",
        construction: "string",
        latitude: null,
        longitude: null,
        length: 1,
        width: 2,
        height: 2,
        quantity: 12,
        distance_road: 70,
        distance_dwelling: 60,
      },
      {
        detonator_type: "text field",
        explosives_permit_magazine_id: 2,
        explosives_permit_id: 1,
        explosives_permit_magazine_type_code: "DET",
        type_no: "1",
        tag_no: "1",
        construction: "string",
        latitude: null,
        longitude: null,
        length: 1,
        width: 2,
        height: 2,
        quantity: 12,
        distance_road: 70,
        distance_dwelling: 60,
      },
    ],
    explosive_magazines: [
      {
        detonator_type: "text field",
        explosives_permit_magazine_id: 3,
        explosives_permit_id: 1,
        explosives_permit_magazine_type_code: "DET",
        type_no: "1",
        tag_no: "1",
        construction: "string",
        latitude: null,
        longitude: null,
        length: 1,
        width: 2,
        height: 2,
        quantity: 12,
        distance_road: 70,
        distance_dwelling: 60,
      },
    ],
  },
  {
    amendment_count: 0,
    amendment_no: 0,
    isAmendment: false,
    explosives_permit_id: 2,
    explosives_permit_guid: "81324623978135",
    permit_number: "BC-145411",
    mines_permit_number: "P-39039404",
    now_number: "1500615-2021-12",
    application_number: "12351235",
    issuing_inspector_name: "John",
    issuing_inspector_party_guid: null,
    originating_system: "Core",
    application_date: "2007-12-04",
    issue_date: "2007-12-04",
    expiry_date: "2007-12-04",
    latitude: null,
    longitude: null,
    application_status: "REC",
    documents: [],
    explosives_permit_amendments: [],
    detonator_magazines: [
      {
        detonator_type: "text field",
        explosives_permit_magazine_id: 4,
        explosives_permit_id: 2,
        explosives_permit_magazine_type_code: "DET",
        type_no: "1",
        tag_no: "1",
        construction: "string",
        latitude: null,
        longitude: null,
        length: 1,
        width: 2,
        height: 2,
        quantity: 12,
        distance_road: 70,
        distance_dwelling: 60,
      },
      {
        detonator_type: "text field",
        explosives_permit_magazine_id: 5,
        explosives_permit_id: 2,
        explosives_permit_magazine_type_code: "DET",
        type_no: "1",
        tag_no: "1",
        construction: "string",
        latitude: null,
        longitude: null,
        length: 1,
        width: 2,
        height: 2,
        quantity: 12,
        distance_road: 70,
        distance_dwelling: 60,
      },
    ],
    explosive_magazines: [
      {
        detonator_type: "text field",
        explosives_permit_magazine_id: 6,
        explosives_permit_id: 2,
        explosives_permit_magazine_type_code: "EXP",
        type_no: "1",
        tag_no: "1",
        construction: "string",
        latitude: null,
        longitude: null,
        length: 1,
        width: 2,
        height: 2,
        quantity: 12,
        distance_road: 70,
        distance_dwelling: 60,
      },
      {
        detonator_type: "text field",
        explosives_permit_magazine_id: 7,
        explosives_permit_id: 2,
        explosives_permit_magazine_type_code: "EXP",
        type_no: "1",
        tag_no: "1",
        construction: "string",
        latitude: null,
        longitude: null,
        length: 1,
        width: 2,
        height: 2,
        quantity: 12,
        distance_road: 70,
        distance_dwelling: 60,
      },
    ],
  },
];
export const EXPLOSIVES_PERMITS = {
  data: {
    records: esupRecords,
  },
};

export const PROJECTS = {
  records: [
    {
      project_guid: "35633148-57f8-4967-be35-7f89abfbd02e",
      project_title: "Test Project Title",
      mine_name: "Sample Mine",
      mine_guid: "40fb0ca4-4dfb-4660-a184-6d031a21f3e9",
      contacts: [],
      project_summary: {
        documents: [],
      },
      information_requirements_table: {
        documents: [],
      },
      major_mine_application: {
        documents: [],
      },
      project_decision_package: {
        documents: [],
      },
    },
  ],
};

export const MAJOR_PROJECTS_DASHBOARD = {
  records: [
    {
      stage: "Project Summary",
      id: 1,
      guid: "3a8087ac-1046-43cb-b152-613db59fff32",
      project_title: "Test Project Title",
      project_id: "1",
      project_guid: "cb33beb3-4c35-4695-b89b-7bab53a5f94a",
      mrc_review_required: false,
      status_code: "SUB",
      contacts: [
        {
          name: "Devin Lucas",
          job_title: null,
          company_name: null,
          email: "fyang@example.org",
          phone_number: "337-588-3109",
          phone_extension: null,
          is_primary: true,
        },
      ],
      update_timestamp: "2022-08-01T00:00:00+00:00",
      mine: {
        mine_type: [
          {
            mine_type_detail: [
              {
                mine_commodity_code: "CG",
              },
            ],
          },
        ],
      },
    },
  ],
};

export const MAJOR_PROJECTS_PAGE_DATA = {
  records: [MAJOR_PROJECTS_DASHBOARD],
  current_page: 1,
  items_per_page: 25,
  total: 25,
  total_pages: 1,
};

export const PROJECT = {
  project_guid: "35633148-57f8-4967-be35-7f89abfbd02e",
  project_title: "Test Project Title",
  mine_name: "Sample Mine",
  mine_guid: "40fb0ca4-4dfb-4660-a184-6d031a21f3e9",
  contacts: [],
  project_summary: {
    documents: [],
  },
  information_requirements_table: {
    documents: [],
  },
  major_mine_application: {
    documents: [],
  },
  project_links: [
    {
      project_link_guid: "90de19e1-7292-4646-af0a-260bd14b1d45",
      project_guid: "8132462392222",
      related_project_guid: "d7411155-dc79-4fa9-8975-c22594aab7ec",
      update_user: "test@bctest",
      update_timestamp: "2023-11-27T18:27:20.598307-07:00",
      create_user: "test@bctest",
      create_timestamp: "2023-11-27T18:27:20.598193-07:00",
      project: {
        project_guid: "8132462392222",
        project_title: "Test Mine",
        proponent_project_id: "Test-123",
        contacts: [
          {
            name: "Test Contact",
          },
        ],
        project_summary: {
          project_summary_guid: "6bab1df6-e181-435a-abc0-e99466411880",
          status_code: "SUB",
        },
        major_mine_application: {
          major_mine_application_guid: "abcde12345",
          status_code: "DFT",
        },
        information_requirements_table: {
          irt_guid: "awxyz12345",
          status_code: "APV",
        },
        update_timestamp: "2023-08-04T09:21:06.028471-06:00",
      },
      related_project: {
        project_guid: "913246239223",
        project_title: "Test Coal",
        proponent_project_id: "TEST-1001",
        contacts: [
          {
            name: "Tom Tester",
          },
        ],
        project_summary: {
          project_summary_guid: "a2e76a72-f306-4973-bda8-37018d15baa2",
          status_code: "SUB",
        },
        major_mine_application: {
          major_mine_application_guid: "abcde12345",
          status_code: "WDN",
        },
        information_requirements_table: {
          irt_guid: "awxyz12345",
          status_code: "APV",
        },
        update_timestamp: "2023-08-24T15:49:16.702250-06:00",
      },
    },
  ],
};

export const PROJECT_SUMMARIES = {
  records: [
    {
      mine_guid: "60300a07-376c-46f1-a984-88a813f91438",
      project_summary_guid: "81324623978135",
      status_code: "OPN",
      project_summary_title: "Sample title",
      project_summary_description: "Sample description",
      proponent_project_id: "25789-x",
      expected_draft_irt_submission_date: "2020-11-10T22:18:19+00:00",
      expected_permit_application_date: "2020-11-12T22:18:19+00:00",
      expected_permit_receipt_date: "2020-11-20T22:18:19+00:00",
      expected_project_start_date: "2020-11-22T22:18:19+00:00",
      documents: [],
      contacts: [],
    },
  ],
};

export const PROJECT_SUMMARY = {
  mine_guid: "60300a07-376c-46f1-a984-88a813f91438",
  project_summary_guid: "81324623978135",
  status_code: "OPN",
  project_summary_title: "Sample title",
  project_summary_description: "Sample description",
  proponent_project_id: "25789-x",
  expected_draft_irt_submission_date: "2020-11-10T22:18:19+00:00",
  expected_permit_application_date: "2020-11-12T22:18:19+00:00",
  expected_permit_receipt_date: "2020-11-20T22:18:19+00:00",
  expected_project_start_date: "2020-11-22T22:18:19+00:00",
  documents: [],
  contacts: [],
  authorizations: [],
};

export const PROJECT_SUMMARY_AUTHORIZATION_TYPES_HASH = {
  MINES_ACT: "Mines Act",
  ENVIRONMENTAL_MANAGMENT_ACT: "Environmental Management Act",
  WATER_SUSTAINABILITY_ACT: "Water Sustainability Act",
  FORESTRY_ACT: "Forestry Act",
  OTHER_LEGISLATION: "Other legislation",
  MINES_ACT_PERMIT: "Mines Act permit",
  AIR_EMISSIONS_DISCHARGE_PERMIT: "Air emissions discharge permit",
  EFFLUENT_DISCHARGE_PERMIT: "Effluent discharge permit",
  REFUSE_DISCHARGE_PERMIT: "Refuse discharge permit",
  MUNICIPAL_WASTEWATER_REGULATION: "Municipal wastewater regulation",
  CHANGE_APPROVAL: "Change approval",
  USE_APPROVAL: "Use approval",
  WATER_LICENCE: "Water licence",
  OCCUPANT_CUT_LICENCE: "Occupant licence to cut",
  OTHER: "Other legislation",
};

export const PROJECT_SUMMARY_PERMIT_TYPES_HASH = {
  NEW: "New",
  AMENDMENT: "Amendment to an existing permit",
  NOTIFICATION: "Notification",
  CLOSURE: "Closure of an existing permit",
  OTHER: "Other",
};

export const PROJECT_SUMMARY_DOCUMENT_TYPES_HASH = {
  GEN: "General",
};

export const PROJECT_SUMMARY_STATUS_CODES_DROPDOWN = [
  {
    value: "ASG",
    label: "Assigned",
    subType: null,
    isActive: true,
  },
  {
    value: "COM",
    label: "Complete",
    subType: null,
    isActive: true,
  },
  {
    value: "DFT",
    label: "Draft",
    subType: null,
    isActive: true,
  },
  {
    value: "IAT",
    label: "Inactive",
    subType: null,
    isActive: true,
  },
  {
    value: "OHD",
    label: "On Hold",
    subType: null,
    isActive: true,
  },
  {
    value: "SUB",
    label: "Submitted",
    subType: null,
    isActive: true,
  },
  {
    value: "UNP",
    label: "Under review - with proponent",
    subType: null,
    isActive: true,
  },
  {
    value: "UNR",
    label: "Under review - with reviewers",
    subType: null,
    isActive: true,
  },
  {
    value: "WDN",
    label: "Withdrawn",
    subType: null,
    isActive: true,
  },
];

export const PROJECT_SUMMARY_STATUS_CODES_HASH = {
  SUB: "Submitted",
  WDN: "Withdrawn",
  DFT: "Draft",
  ASG: "Assigned",
  UNP: "Under review - with proponent",
  UNR: "Under review - with reviewers",
  COM: "Complete",
  OHD: "On Hold",
  IAT: "Inactive",
};

export const PROJECT_SUMMARY_STATUS_ALIAS_CODES_DROPDOWN = [
  {
    value: "COM",
    label: "Complete",
    subType: null,
    isActive: true,
  },
  {
    value: "DFT",
    label: "Draft",
    subType: null,
    isActive: true,
  },
  {
    value: "IAT",
    label: "Inactive",
    subType: null,
    isActive: true,
  },
  {
    value: "OHD",
    label: "On Hold",
    subType: null,
    isActive: true,
  },
  {
    value: "SUB",
    label: "Submitted",
    subType: null,
    isActive: true,
  },
  {
    value: "ASG",
    label: "Submitted",
    subType: null,
    isActive: true,
  },
  {
    value: "UNP",
    label: "Under review",
    subType: null,
    isActive: true,
  },
  {
    value: "UNR",
    label: "Under review",
    subType: null,
    isActive: true,
  },
  {
    value: "WDN",
    label: "Withdrawn",
    subType: null,
    isActive: true,
  },
];

export const PROJECT_SUMMARY_STATUS_ALIAS_CODES_HASH = {
  SUB: "Submitted",
  WDN: "Withdrawn",
  DFT: "Draft",
  ASG: "Submitted",
  UNP: "Under review",
  UNR: "Under review",
  COM: "Complete",
  OHD: "On Hold",
  IAT: "Inactive",
};

export const PROJECT_SUMMARY_DOCUMENT_TYPES_DROPDOWN = [
  {
    value: "GEN",
    label: "General",
    subType: null,
    isActive: true,
  },
];

export const PROJECT_SUMMARY_PERMIT_TYPES_DROPDOWN = [
  {
    value: "AMENDMENT",
    label: "Amendment to an existing permit",
    subType: null,
    isActive: true,
  },
  {
    value: "CLOSURE",
    label: "Closure of an existing permit",
    subType: null,
    isActive: true,
  },
  {
    value: "NEW",
    label: "New",
    subType: null,
    isActive: true,
  },
  {
    value: "NOTIFICATION",
    label: "Notification",
    subType: null,
    isActive: true,
  },
  {
    value: "OTHER",
    label: "Other",
    subType: null,
    isActive: true,
  },
];

export const PROJECT_SUMMARY_AUTHORIZATION_TYPES_TRANSFORMED = [
  {
    code: "MINES_ACT",
    description: "Mines Act",
    children: [{ code: "MINES_ACT_PERMIT", description: "Mines Act permit" }],
  },
  {
    code: "ENVIRONMENTAL_MANAGMENT_ACT",
    description: "Environmental Management Act",
    children: [
      { code: "AIR_EMISSIONS_DISCHARGE_PERMIT", description: "Air emissions discharge permit" },
      { code: "EFFLUENT_DISCHARGE_PERMIT", description: "Effluent discharge permit" },
      { code: "REFUSE_DISCHARGE_PERMIT", description: "Refuse discharge permit" },
      { code: "MUNICIPAL_WASTEWATER_REGULATION", description: "Municipal wastewater regulation" },
    ],
  },
  {
    code: "WATER_SUSTAINABILITY_ACT",
    description: "Water Sustainability Act",
    children: [
      { code: "CHANGE_APPROVAL", description: "Change approval" },
      { code: "USE_APPROVAL", description: "Use approval" },
      { code: "WATER_LICENCE", description: "Water licence" },
    ],
  },
  {
    code: "FORESTRY_ACT",
    description: "Forestry Act",
    children: [{ code: "OCCUPANT_CUT_LICENCE", description: "Occupant licence to cut" }],
  },
  {
    code: "OTHER_LEGISLATION",
    description: "Other legislation",
    children: [{ code: "OTHER", description: "Other legislation" }],
  },
];

export const PROJECT_SUMMARY_CHILD_AUTHORIZATION_TYPES_HASH = {
  AIR_EMISSIONS_DISCHARGE_PERMIT: {
    description: "Air emissions discharge permit",
    parent: { code: "ENVIRONMENTAL_MANAGMENT_ACT", description: "Environmental Management Act" },
  },
  CHANGE_APPROVAL: {
    description: "Change approval",
    parent: { code: "WATER_SUSTAINABILITY_ACT", description: "Water Sustainability Act" },
  },

  EFFLUENT_DISCHARGE_PERMIT: {
    description: "Effluent discharge permit",
    parent: { code: "ENVIRONMENTAL_MANAGMENT_ACT", description: "Environmental Management Act" },
  },
  MINES_ACT_PERMIT: {
    description: "Mines Act permit",
    parent: { code: "MINES_ACT", description: "Mines Act" },
  },
  MUNICIPAL_WASTEWATER_REGULATION: {
    description: "Municipal wastewater regulation",
    parent: { code: "ENVIRONMENTAL_MANAGMENT_ACT", description: "Environmental Management Act" },
  },
  OCCUPANT_CUT_LICENCE: {
    description: "Occupant licence to cut",
    parent: { code: "FORESTRY_ACT", description: "Forestry Act" },
  },
  OTHER: {
    description: "Other legislation",
    parent: { code: "OTHER_LEGISLATION", description: "Other legislation" },
  },
  REFUSE_DISCHARGE_PERMIT: {
    description: "Refuse discharge permit",
    parent: { code: "ENVIRONMENTAL_MANAGMENT_ACT", description: "Environmental Management Act" },
  },
  USE_APPROVAL: {
    description: "Use approval",
    parent: { code: "WATER_SUSTAINABILITY_ACT", description: "Water Sustainability Act" },
  },
  WATER_LICENCE: {
    description: "Water licence",
    parent: { code: "WATER_SUSTAINABILITY_ACT", description: "Water Sustainability Act" },
  },
};

export const REQUIREMENTS = {
  records: [
    {
      requirement_guid: "d9996a84-30b0-4de6-b171-c959bdae0e3f",
      requirement_id: 1,
      parent_requirement_id: null,
      description: "Introduction and Project Overview",
      display_order: 1,
      deleted_ind: false,
      sub_requirements: [
        {
          requirement_guid: "56e58309-9f63-401c-b26d-bfdc867ebe5c",
          requirement_id: 12,
          parent_requirement_id: 1,
          description: "Project Overview",
          display_order: 3,
          deleted_ind: false,
          sub_requirements: [
            {
              requirement_guid: "9e43699d-da0c-49e4-849e-18fc74d33a4f",
              requirement_id: 78,
              parent_requirement_id: 12,
              description: "Project History",
              display_order: 1,
              deleted_ind: false,
              sub_requirements: [],
              step: "1.3.1.",
            },
          ],
          step: "1.3.",
        },
        {
          requirement_guid: "808a2f93-9774-49ae-bc85-82be8ce3ea2f",
          requirement_id: 13,
          parent_requirement_id: 1,
          description: "Regulatory Framework",
          display_order: 4,
          deleted_ind: false,
          sub_requirements: [],
          step: "1.4.",
        },
      ],
      step: "1.",
    },
  ],
};

export const INFORMATION_REQUIREMENTS_TABLE = {
  irt_id: 1,
  irt_guid: "9a5a10ce-ead2-4346-8a85-b3320c5b454b",
  project_guid: "fba9b698-6d40-4df1-9914-84008c3c586f",
  status_code: "SUB",
  requirements: [
    {
      irt_requirements_xref_guid: "38c5de09-3aef-4269-b606-e0f6b37f0775",
      requirement_guid: "1fc02704-b8d9-48e9-abbd-67db21855d48",
      deleted_ind: false,
      required: "True",
      methods: "True",
      comment: "1",
    },
    {
      irt_requirements_xref_guid: "2d98e665-ca1f-4cf5-8aae-ac5e7fb54b9a",
      requirement_guid: "b509efe1-422e-42eb-aaeb-ce7ebaaea25c",
      deleted_ind: false,
      required: "True",
      methods: "True",
      comment: "2",
    },
  ],
};

export const INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_HASH = {
  DFT: "Draft",
  SUB: "Submitted",
  UNR: "In Review",
  APV: "Review Complete",
  CHR: "Change Requested",
};

export const INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_DROPDOWN = [
  {
    value: "SUB",
    label: "Submitted",
    subType: null,
    isActive: true,
  },
  {
    value: "UNR",
    label: "In Review",
    subType: null,
    isActive: true,
  },
  {
    value: "APV",
    label: "Review Complete",
    subType: null,
    isActive: true,
  },
  {
    value: "CHR",
    label: "Change Requested",
    subType: null,
    isActive: true,
  },
];

export const MAJOR_MINES_APPLICATION_STATUS_CODES_DROPDOWN = [
  {
    value: "SUB",
    label: "Submitted",
    subType: null,
    isActive: true,
  },
  {
    value: "UNR",
    label: "In Review",
    subType: null,
    isActive: true,
  },
  {
    value: "APV",
    label: "Review Complete",
    subType: null,
    isActive: true,
  },
  {
    value: "CHR",
    label: "Change Requested",
    subType: null,
    isActive: true,
  },
];

export const MAJOR_MINES_APPLICATION = {
  major_mine_application_id: 1,
  major_mine_application_guid: "c16afb82-144c-4138-9a36-ba5c24c43d8a",
  project_guid: "a383ead7-0c1c-402f-9a6e-6736cb5ce0b5",
  status_code: "SUB",
  documents: [
    {
      major_mine_application_id: 1,
      major_mine_application_document_type_code: "PRM",
      mine_document_guid: "479af6fe-823d-4014-bed1-5133a007c71f",
      mine_guid: "c899ea6b-2e43-49d9-b2ce-6a5b2e8c2816",
      document_manager_guid: "0ed74348-c1ed-41d5-a6ad-3e1f42cf0b41",
      document_name: "primary-document.pdf",
      upload_date: "2022-07-14T04:32:58.659745+00:00",
      create_user: "mining@bceid.com",
    },
    {
      major_mine_application_id: 1,
      major_mine_application_document_type_code: "SPT",
      mine_document_guid: "f9b93bd0-e3ac-4bee-918b-3bc82224f2a9",
      mine_guid: "c899ea6b-2e43-49d9-b2ce-6a5b2e8c2816",
      document_manager_guid: "5a115b22-2d11-4c6d-b378-fe451389cec0",
      document_name: "spatial-document.pdf",
      upload_date: "2022-07-14T04:32:58.662545+00:00",
      create_user: "mining@bceid.com",
    },
    {
      major_mine_application_id: 1,
      major_mine_application_document_type_code: "SPR",
      mine_document_guid: "05463375-aa6d-4461-b7b7-bf4b2001b610",
      mine_guid: "c899ea6b-2e43-49d9-b2ce-6a5b2e8c2816",
      document_manager_guid: "47465789-2dde-4185-9f3a-92a468ab732f",
      document_name: "supporting-document.pdf",
      upload_date: "2022-07-14T04:32:58.663901+00:00",
      create_user: "mining@bceid.com",
    },
  ],
  update_user: "mining@bceid.com",
  update_timestamp: "2022-07-14T04:32:58.666528+00:00",
  create_user: "mining@bceid.com",
  create_timestamp: "2022-07-14T04:32:58.666414+00:00",
};

export const MAJOR_MINES_APPLICATION_DOCUMENT_TYPES_HASH = {
  PRM: "Primary",
  SPT: "Spatial",
  SPR: "Supporting",
};

export const MAJOR_MINES_APPLICATION_STATUS_CODES_HASH = {
  DFT: "Draft",
  SUB: "Submitted",
  UNR: "In review - with reviewers",
  APV: "Approved",
  CHR: "Change Requested",
};

export const EMLI_TYPE_CODES_DROPDOWN = [
  {
    value: "HSI",
    label: "Health and Safety Inspector",
    subType: null,
    isActive: true,
  },
  {
    value: "RDR",
    label: "Regional Director",
    subType: null,
    isActive: true,
  },
  {
    value: "ROE",
    label: "Regional Office",
    subType: null,
    isActive: true,
  },
  {
    value: "SHI",
    label: "Senior Health, Safety and Environment Inspector",
    subType: null,
    isActive: true,
  },
  {
    value: "SPI",
    label: "Senior Permitting Inspector",
    subType: null,
    isActive: true,
  },
];

export const EMLI_TYPE_CODES_HASH = {
  HSI: "Health and Safety Inspector",
  RDR: "Regional Director",
  ROE: "Regional Office",
  SHI: "Senior Health, Safety and Environment Inspector",
  SPI: "Senior Permitting Inspector",
};

export const MINE_EPIC_INFO = {
  records: {
    mine_info: {
      mine_guid: "a157accf-7a61-40ea-a78c-6d23a6bb944b",
      summary:
        "<p>Located about 25 km north of the town of Sparwood, Line Creek Operations is one of Teck's five metallurgical coal mines in southeast British Columbia's Elk Valley.\n<p>Line Creek Operations opened in 1981 and currently employs about 490 workers. Proven and probable reserves are projected to support mining at Line Creek at currently planned production rates for another 23 years.\n<p>The West Line Creek Active Water Treatment Facility began full operations in March 2016. This is the first of the water treatment facilities planned for Teck's Elk Valley mines, as outlined in the Elk Valley Water Quality Plan. The goal of the Elk Valley Water Quality Plan is to stabilize and reverse the increasing trend of selenium and other substances to maintain the health of the Elk Valley watershed, while at the same time allowing for mining in the region to continue. Selenium concentrations in water treated at the West Line Creek Active Water Treatment Facility are reduced by about 96%, and nitrate concentrations in treated water are reduced by over 99%.</p>",
      projects: [
        {
          project_id: "58851185aaecd9001b821677",
          project_legislation_year: 2002,
          project_lead: "Karen Christie",
          project_lead_email: "test@test.ca",
          project_lead_phone: "123-456-7890",
          responsible_EPD: "Karen Christie",
          responsible_EPD_email: "test@test.ca",
          responsible_EPD_phone: "778 698-9347",
          link: "https://projects.eao.gov.bc.ca/p/58851185aaecd9001b821677/project-details",
        },
        {
          project_id: "58851079aaecd9001b810cb5",
          project_legislation_year: 1996,
          project_lead: "Karen Christie",
          project_lead_email: "test@test.ca",
          project_lead_phone: "123-456-7890",
          responsible_EPD: "Karen Christie",
          responsible_EPD_email: "test@test.ca",
          responsible_EPD_phone: "123-456-7890",
          link: "https://projects.eao.gov.bc.ca/p/58851079aaecd9001b810cb5/project-details",
        },
      ],
    },
  },
};

export const NOTICES_OF_DEPARTURE: { records: INoticeOfDeparture[] } = {
  records: [
    {
      mine: null,
      documents: [],
      nod_guid: "0d3ec917-179f-4dbc-80a3-4c993fdfe596",
      nod_no: "NOD-X-45564456-01",
      nod_title: "Some title",
      nod_description: "Some description",
      create_timestamp: "2020-04-20 11:58",
      update_timestamp: "2020-04-20 11:58",
      submission_timestamp: "2020-04-20 11:58",
      permit: {
        permit_id: 1,
        permit_guid: "10d3ec917-179f-4dbc-80a3-4c993fdfe596",
        permit_no: "M-7594809",
        permit_status_code: "C",
        current_permittee: "Haynes, Park and Brown",
        permit_prefix: "M",
      },
      nod_status: NodStatusSaveEnum.pending_review,
      nod_type: NoDTypeSaveEnum.potentially_substantial,
      mine_manager_name: "Maaanager",
    },
  ],
};

export const NOTICE_OF_DEPARTURE_DETAILS = {
  nod_guid: "56c75a01-248f-4e2c-961a-131790205682",
  nod_title: "Test with checklist 1",
  nod_description: "Checklist description",
  create_timestamp: "2022-05-05T15:44:48.204164+00:00",
  update_timestamp: "2022-05-05T15:44:48.205068+00:00",
  submission_timestamp: "2022-05-05T15:44:48.205086",
  permit: {
    permit_id: 10,
    permit_guid: "b6cc4e58-993f-4045-8e3b-27b0935d5ef7",
    permit_no: "CX-6515762",
    permit_status_code: "O",
    current_permittee: "Richardson-Weiss",
    permit_prefix: "C",
  },
  nod_status: "pending_review",
  nod_type: "potentially_substantial",
  documents: [
    {
      document_type: "checklist",
      create_timestamp: "2022-05-05T15:44:49.419460+00:00",
      mine_document_guid: "f678c3b6-8514-43fb-a147-a6caf5deeb50",
      mine_guid: "29050da9-5d9e-4a80-9f6d-1d06f02fc589",
      document_manager_guid: "8e1e0182-fef4-4f93-b76a-d2b65b6f3908",
      document_name: "Excel_Comments_Template.xlsx",
      upload_date: null,
    },
  ],
};

export const PROJECT_DECISION_PACKAGE = {
  project_decision_package_id: 1,
  project_decision_package_guid: "c16afb82-144c-4138-9a36-ba5c24c43d8a",
  project_guid: "a383ead7-0c1c-402f-9a6e-6736cb5ce0b5",
  status_code: "INP",
  documents: [
    {
      project_decision_package_id: 1,
      project_decision_package_document_type_code: "DCP",
      mine_document_guid: "479af6fe-823d-4014-bed1-5133a007c71f",
      mine_guid: "c899ea6b-2e43-49d9-b2ce-6a5b2e8c2816",
      document_manager_guid: "0ed74348-c1ed-41d5-a6ad-3e1f42cf0b41",
      document_name: "decision-document.pdf",
      upload_date: "2022-07-14T04:32:58.659745+00:00",
      create_user: "mining@bceid.com",
    },
    {
      project_decision_package_id: 1,
      project_decision_package_document_type_code: "ADG",
      mine_document_guid: "f9b93bd0-e3ac-4bee-918b-3bc82224f2a9",
      mine_guid: "c899ea6b-2e43-49d9-b2ce-6a5b2e8c2816",
      document_manager_guid: "5a115b22-2d11-4c6d-b378-fe451389cec0",
      document_name: "additional-government-document.pdf",
      upload_date: "2022-07-14T04:32:58.662545+00:00",
      create_user: "mining@bceid.com",
    },
    {
      project_decision_package_id: 1,
      project_decision_package_document_type_code: "INM",
      mine_document_guid: "05463375-aa6d-4461-b7b7-bf4b2001b610",
      mine_guid: "c899ea6b-2e43-49d9-b2ce-6a5b2e8c2816",
      document_manager_guid: "47465789-2dde-4185-9f3a-92a468ab732f",
      document_name: "internal-ministry-document.pdf",
      upload_date: "2022-07-14T04:32:58.663901+00:00",
      create_user: "mining@bceid.com",
    },
  ],
  update_user: "mining@bceid.com",
  update_timestamp: "2022-08-31T04:32:58.666528+00:00",
  create_user: "mining@bceid.com",
  create_timestamp: "2022-08-31T04:32:58.666414+00:00",
};

export const ACTIVITIES = {
  data: {
    records: [
      {
        notification_guid: "da05d3a4-dcd3-467a-83f1-84f27d28d370",
        notification_recipient: "ssmaaber",
        notification_read: false,
        notification_document: {
          message: "Notice of Departure Submitted for Bennett Group",
          metadata: {
            mine: {
              mine_no: "92433731",
              mine_guid: "81595650-fcb3-42e0-a1d0-c92b9c2d0ed2",
              mine_name: "Bennett Group",
            },
            entity: "NoticeOfDeparture",
            permit: {
              permit_no: "M-5830615",
            },
            entity_guid: "9f64f9ac-3777-4ba0-825a-3b132e60ac51",
          },
        },
        create_timestamp: "2022-08-08T20:59:02.319606+00:00",
        update_timestamp: "2022-08-08T20:59:02.319691+00:00",
      },
      {
        notification_guid: "bea36249-3650-4813-95ac-ecde93d073ee",
        notification_recipient: "ssmaaber",
        notification_read: false,
        notification_document: {
          message: "Notice of Departure Submitted for Bennett Group",
          metadata: {
            mine: {
              mine_no: "92433731",
              mine_guid: "81595650-fcb3-42e0-a1d0-c92b9c2d0ed2",
              mine_name: "Bennett Group",
            },
            entity: "NoticeOfDeparture",
            permit: {
              permit_no: "M-5830615",
            },
            entity_guid: "d035fd3f-5eda-4b65-94f7-b267f6dd333e",
          },
        },
        create_timestamp: "2022-08-08T20:59:01.859001+00:00",
        update_timestamp: "2022-08-08T20:59:01.859104+00:00",
      },
      {
        notification_guid: "cdfa0f05-e202-4437-8ee3-1797b1dd83f8",
        notification_recipient: "ssmaaber",
        notification_read: false,
        notification_document: {
          message: "Notice of Departure Submitted for Bennett Group",
          metadata: {
            mine: {
              mine_no: "92433731",
              mine_guid: "81595650-fcb3-42e0-a1d0-c92b9c2d0ed2",
              mine_name: "Bennett Group",
            },
            entity: "NoticeOfDeparture",
            permit: {
              permit_no: "M-5830615",
            },
            entity_guid: "8499a61b-87ec-4572-a181-7bc966b0b642",
          },
        },
        create_timestamp: "2022-08-08T20:59:01.482269+00:00",
        update_timestamp: "2022-08-08T20:59:01.482461+00:00",
      },
    ],
    total: 3,
  },
};

export const VERIFIABLE_CREDENTIALS_CONNECTIONS = [
  {
    party_guid: "1234",
    permit_amendment_guid: "1234",
    cred_exch_id: "1234",
    cred_exch_state: VC_CRED_ISSUE_STATES.credential_acked,
    rev_reg_id: "1234",
    cred_rev_id: "1234",
  },
];
