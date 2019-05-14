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
      mine_permit: [],
      mineral_tenure_xref: [
        {
          tenure_number_id: "1234567",
        },
      ],
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
        },
      ],
      mine_expected_documents: [
        {
          date_created: "2018-11-19",
          due_date: "",
          exp_document_guid: "806608ed-d2b4-4f83-8b22-739d5223c56f",
          exp_document_name: "OMS Manual",
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          req_document_guid: "c95886bc-e4b2-4743-b38d-42eea858e9ee",
          expected_document_status: {
            exp_document_status_code: "MIA",
            description: "Not Received",
          },
          related_documents: [],
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
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
      mine_permit: [
        {
          permit_guid: "2ec66cff-dbf0-4e4b-b9b8-9c7740ba8c81",
          permit_no: "KNaaWwVdiJ40",
        },
        {
          permit_guid: "1877097f-bf9d-40c8-a5fa-53d9a79623c9",
          permit_no: "xfM0c0ZKEw7B",
        },
      ],
      mineral_tenure_xref: [
        {
          tenure_number_id: "1234567",
        },
      ],
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
        },
      ],
      mine_expected_documents: [
        {
          date_created: "2018-11-19",
          due_date: "",
          exp_document_guid: "806608ed-d2b4-4f83-8b22-739d5223c56f",
          exp_document_name: "OMS Manual",
          mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
          req_document_guid: "c95886bc-e4b2-4743-b38d-42eea858e9ee",
          expected_document_status: {
            exp_document_status_code: "MIA",
            description: "Not Received",
          },
          related_documents: [],
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
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
      mine_permit: [],
      mineral_tenure_xref: [
        {
          tenure_number_id: "1234567",
        },
      ],
      mine_location: { longitude: null, latitude: null },
      mine_tailings_storage_facility: [
        {
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f78",
          mine_tailings_storage_facility_name: "MockTSF",
        },
      ],
      mine_expected_documents: [
        {
          date_created: "2018-11-19",
          due_date: "",
          exp_document_guid: "806608ed-d2b4-4f83-8b22-739d5223c56f",
          exp_document_name: "OMS Manual",
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          req_document_guid: "c95886bc-e4b2-4743-b38d-42eea858e9ee",
          exp_document_status: {
            exp_document_status_code: "MIA",
            description: "Not Received",
          },
          related_documents: [],
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
  mineIds: ["18133c75-49ad-4101-85f3-a43e35ae989a", "18145c75-49ad-0101-85f3-a43e45ae989a"],
  mines: {
    "18133c75-49ad-4101-85f3-a43e35ae989a": {
      mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      mine_name: "mine3",
      mine_no: "BLAH9091",
      mine_region: "NE",
      mine_permit: [],
      mineral_tenure_xref: [
        {
          tenure_number_id: "1234567",
        },
      ],
      mine_location: { longitude: null, latitude: null },
      mine_tailings_storage_facilities: [
        {
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f78",
          mine_tailings_storage_facility_name: "MockTSF",
        },
      ],
      mine_expected_documents: [
        {
          date_created: "2018-11-19",
          due_date: "",
          exp_document_guid: "806608ed-d2b4-4f83-8b22-739d5223c56f",
          exp_document_name: "OMS Manual",
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          req_document_guid: "c95886bc-e4b2-4743-b38d-42eea858e9ee",
          expected_document_status: {
            exp_document_status_code: "MIA",
            description: "Not Received",
          },
          related_documents: [],
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
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
    "18145c75-49ad-0101-85f3-a43e45ae989a": {
      mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      mine_name: "mine2",
      mine_no: "BLAH9091",
      mine_region: "NE",
      mine_permit: [
        {
          permit_guid: "2ec66cff-dbf0-4e4b-b9b8-9c7740ba8c81",
          permit_no: "KNaaWwVdiJ40",
        },
        {
          permit_guid: "1877097f-bf9d-40c8-a5fa-53d9a79623c9",
          permit_no: "xfM0c0ZKEw7B",
        },
      ],
      mineral_tenure_xref: [
        {
          tenure_number_id: "1234567",
        },
      ],
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
        },
      ],
      mine_expected_documents: [
        {
          date_created: "2018-11-19",
          due_date: "",
          exp_document_guid: "806608ed-d2b4-4f83-8b22-739d5223c56f",
          exp_document_name: "OMS Manual",
          mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
          req_document_guid: "c95886bc-e4b2-4743-b38d-42eea858e9ee",
          expected_document_status: {
            exp_document_status_code: "MIA",
            description: "Not Received",
          },
          related_documents: [],
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
      verified_status: {
        mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
        mine_name: "mine2",
        healthy_ind: true,
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
      guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      name: "mock name",
    },
    "18145c75-49ad-0101-85f3-a43e45ae989a": {
      guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      name: "mock Two",
    },
  },
  partiesWithAppointments: {
    "18133c75-49ad-4101-85f3-a43e35ae989a": {
      guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      name: "mock name",
      mine_party_appt: [],
    },
    "18145c75-49ad-0101-85f3-a43e45ae989a": {
      guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      name: "mock Two",
      mine_party_appt: [],
    },
  },
};

export const MINE_NAME_LIST = [
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
];

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

export const MINESPACE_RESPONSE = { users: MINESPACE_USERS };

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
};

export const COORDINATES = [48.70707, -122.489504];
export const STATUS_OPTIONS = {
  options: [
    {
      value: "ABN",
      label: "Abandoned",
    },
    {
      value: "CLD",
      label: "Closed",
      children: [
        {
          value: "CM",
          label: "Care & Maintenance",
        },
        {
          value: "REC",
          label: "Reclamation",
          children: [
            {
              value: "LTM",
              label: "Long Term Maintenance",
            },
            {
              value: "LWT",
              label: "Long Term Maintenance Water Treatment",
            },
            {
              value: "PRP",
              label: "Permit Release Pending",
            },
          ],
        },
        {
          value: "ORP",
          label: "Orphaned",
          children: [
            {
              value: "LTM",
              label: "Long Term Maintenance",
            },
            {
              value: "LWT",
              label: "Long Term Maintenance Water Treatment",
            },
            {
              value: "RNS",
              label: "Reclamation Not Starte",
            },
            {
              value: "SVR",
              label: "Site Visit Required",
            },
          ],
        },
        {
          value: "UN",
          label: "Unknown",
        },
      ],
    },
    {
      value: "NS",
      label: "Not Started",
    },
    {
      value: "OP",
      label: "Operating",
      children: [
        {
          value: "YR",
          label: "Year round",
        },
        {
          value: "SEA",
          label: "Seasonal",
        },
      ],
    },
  ],
};

export const REGION_OPTIONS = {
  options: [
    {
      value: "SW",
      label: "South West",
    },
    {
      value: "SC",
      label: "South Central",
    },
    {
      value: "NW",
      label: "North West",
    },
    {
      value: "NE",
      label: "North East",
    },
    {
      value: "SE",
      label: "South East",
    },
  ],
};

export const REGION_HASH = {
  SW: "South West",
  SC: "South Central",
  NW: "North West",
  NE: "North East",
  SE: "South East",
};

export const TENURE_TYPES = [
  { value: "COL", label: "Coal" },
  { value: "MIN", label: "Mineral" },
  { value: "PLR", label: "Placer" },
  { value: "BCL", label: "BC Land" },
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

export const EXPECTED_DOCUMENT_STATUS_OPTIONS = {
  options: [
    { exp_document_status_code: "MIA", description: "Not Received" },
    { exp_document_status_code: "PRE", description: "Received / Pending Review" },
    { exp_document_status_code: "RIP", description: "Review In Progress" },
    { exp_document_status_code: "ACC", description: "Accepted" },
    { exp_document_status_code: "REJ", description: "Rejected / Waiting On Update" },
  ],
};

export const MINE_TSF_REQUIRED_REPORTS_RESPONSE = {
  required_documents: [
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
    amendments: [
      {
        permit_amendment_guid: "822310fd-3a2c-44a9-a9ce-dee81acc9585",
        permit_guid: "71d00d45-9fda-45d3-a4b0-59a7ceb6518e",
        permit_amendment_status_code: "ACT",
        permit_amendment_type_code: "OGP",
        received_date: null,
        issue_date: "2019-04-01",
        authorization_end_date: null,
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
    ],
  },
];

export const USER_ACCESS_DATA = [
  "mds-mine-view",
  "idir",
  "mds-mine-create",
  "offline_access",
  "admin",
  "uma_authorization",
  "mds-mine-admin",
];

export const DISTURBANCE_OPTIONS = {
  options: [
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
  options: [
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
    value: "TO",
    label: "Thermal Coal",
  },
  {
    value: "MC",
    label: "Metallurgic",
  },
  {
    value: "CG",
    label: "Construction Aggregate",
  },
];

export const DROPDOWN_PROVINCE_OPTIONS = [
  {
    value: "BC",
    label: "BC",
  },
  {
    value: "AB",
    label: "AB",
  },
];

export const PROVINCE_OPTIONS = {
  options: [
    { description: "British Columbia", display_order: 10, sub_division_code: "BC" },
    { description: "Alberta", display_order: 10, sub_division_code: "AB" },
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
  mine_documents: [
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

export const APPLICATION_STATUS_CODE_OPTIONS = [
  { application_status_code: "RIP", description: "In Review" },
  { application_status_code: "APR", description: "Approved" },
];

export const VARIANCES = {
  records: [
    {
      variance_guid: "0d3ec917-179f-4dbc-80a3-4c993fdfe596",
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
};

export const COMPLIANCE_CODES = {
  records: [
    {
      article_act_code: "HSRCM",
      compliance_article_id: 305,
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
      compliance_article_id: 306,
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

export const APPLICATION_LIST = {
  applications: [
    {
      application_guid: "85e05fe9-2b5a-4e6d-a7d0-cc1a2395dd14",
      application_no: "TA-09876",
      application_status_code: "RIP",
      description: "Test.",
      received_date: "2019-03-06",
    },
    {
      application_guid: "85e05fe9-2b5a-4e6d-a7d0-cc1a2395dd11",
      application_no: "TA-93475",
      application_status_code: "RIP",
      description: null,
      received_date: "2019-02-25",
    },
  ],
};

export const CORE_USERS = {
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

export const CORE_USERS_DROPDOWN = [
  { value: "51b3a499-a474-4d52-be99-5c5123d7501c", label: "BLAH" },
];

export const CORE_USERS_HASH = {
  "51b3a499-a474-4d52-be99-5c5123d7501c": "BLAH",
};

export const INCIDENTS = {
  mine_incidents: [
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
};

export const FOLLOWUP_ACTIONS = [
  {
    mine_incident_followup_type_code: "NOA",
    description: "No Action",
    display_order: 20,
    active_ind: true,
  },
];

export const VARIANCE_STATUS_OPTIONS = {
  records: [
    {
      variance_application_status_code: "REV",
      description: "In Review",
    },
    {
      variance_application_status_code: "NAP",
      description: "Not Applicable",
    },
    {
      variance_application_status_code: "APP",
      description: "Approved",
    },
    {
      variance_application_status_code: "DEN",
      description: "Denied",
    },
  ],
};

export const VARIANCE_DROPDOWN_STATUS_OPTIONS = [
  {
    label: "In Review",
    value: "REV",
  },
  {
    label: "Not Applicable",
    value: "NAP",
  },
  {
    label: "Approved",
    value: "APP",
  },
  {
    label: "Denied",
    value: "DEN",
  },
];

export const VARIANCE_STATUS_OPTIONS_HASH = {
  REV: "In Review",
  NAP: "Not Applicable",
  APP: "Approved",
  DEN: "Denied",
};
