export const createMockHeader = () => ({
  headers: {
    "Access-Control-Allow-Origin": "*",
    Authorization: "mockToken",
  },
});

export const ERROR = { error: { message: "Errors", status: 400 } };

// used for testing selectors
export const MINE_RESPONSE = {
  mines: [
    {
      guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      mgr_appointment: [],
      mine_permit: [],
      mineral_tenure_xref: [
        {
          tenure_number_id: "1234567",
        },
      ],
      mine_detail: [
        {
          mine_name: "mine1",
          mine_no: "BLAH9091",
          region_code: "NE",
        },
        {
          mine_name: "mine3",
          mine_no: "BLAH9091",
          region_code: "NE",
        },
      ],
      mine_location: [{ longitude: null, latitude: null }],
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: "9999-12-31",
      },
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
          due_date: "None",
          exp_document_guid: "806608ed-d2b4-4f83-8b22-739d5223c56f",
          exp_document_name: "OMS Manual",
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          req_document_guid: "c95886bc-e4b2-4743-b38d-42eea858e9ee",
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
    },
    {
      guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      mgr_appointment: [],
      mine_permit: [
        {
          expiry_date: "9999-12-31",
          issue_date: "9999-12-31",
          mine_guid: "1628847c-060b-45f2-990f-815877174801",
          permit_guid: "2ec66cff-dbf0-4e4b-b9b8-9c7740ba8c81",
          permit_no: "KNaaWwVdiJ40",
          permit_status_code: "Z",
          permittee: [
            {
              effective_date: "2018-10-02",
              expiry_date: "9999-12-31",
              party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
              party_name: "Yivihoke",
              permit_guid: "2ec66cff-dbf0-4e4b-b9b8-9c7740ba8c81",
              permittee_guid: "abd4c8bb-48ac-4ec2-b296-5f38d4118176",
              party: {
                effective_date: "2018-10-03",
                email: "JgHxeyjv@aezZIwee.com",
                expiry_date: "9999-12-31",
                first_name: "Tiyudoveh",
                name: "Tiyudoveh Higesewawa",
                party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
                party_name: "Higesewawa",
                party_type_code: "PER",
                phone_ext: null,
                phone_no: "123-123-1234",
              },
            },
          ],
        },
        {
          expiry_date: "9999-12-31",
          issue_date: "9999-12-31",
          mine_guid: "1628847c-060b-45f2-990f-815877174801",
          permit_guid: "1877097f-bf9d-40c8-a5fa-53d9a79623c9",
          permit_no: "xfM0c0ZKEw7B",
          permit_status_code: "Z",
          permittee: [
            {
              effective_date: "2018-10-02",
              expiry_date: "9999-12-31",
              party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
              party_name: "Yivihoke",
              permit_guid: "1877097f-bf9d-40c8-a5fa-53d9a79623c9",
              permittee_guid: "3491c9a5-8f09-471f-bb1b-3ea246eb9796",
              party: {
                effective_date: "2018-10-03",
                email: "JgHxeyjv@aezZIwee.com",
                expiry_date: "9999-12-31",
                first_name: "Tiyudoveh",
                name: "Tiyudoveh Higesewawa",
                party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
                party_name: "Higesewawa",
                party_type_code: "PER",
                phone_ext: null,
                phone_no: "123-123-1234",
              },
            },
          ],
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
        expiry_date: "9999-12-31",
      },
      mine_detail: [
        {
          mine_name: "mine1",
          mine_no: "BLAH9091",
          region_code: "NE",
        },
        {
          mine_name: "mine2",
          mine_no: "BLAH9091",
          region_code: "NE",
        },
      ],
      mine_location: [
        {
          longitude: null,
          latitude: null,
        },
      ],
      mine_tailings_storage_facility: [
        {
          mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f34",
          mine_tailings_storage_facility_name: "MockTSF1",
        },
      ],
      mine_expected_documents: [
        {
          date_created: "2018-11-19",
          due_date: "None",
          exp_document_guid: "806608ed-d2b4-4f83-8b22-739d5223c56f",
          exp_document_name: "OMS Manual",
          mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
          req_document_guid: "c95886bc-e4b2-4743-b38d-42eea858e9ee",
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
    },
  ],
};

export const MINES = {
  mineIds: ["18133c75-49ad-4101-85f3-a43e35ae989a", "18145c75-49ad-0101-85f3-a43e45ae989a"],
  mines: {
    "18133c75-49ad-4101-85f3-a43e35ae989a": {
      guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      mgr_appointment: [],
      mine_permit: [],
      mineral_tenure_xref: [
        {
          tenure_number_id: "1234567",
        },
      ],
      mine_detail: [
        {
          mine_name: "mine1",
          mine_no: "BLAH9091",
          region_code: "NE",
        },
        {
          mine_name: "mine3",
          mine_no: "BLAH9091",
          region_code: "NE",
        },
      ],
      mine_location: [{ longitude: null, latitude: null }],
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
          due_date: "None",
          exp_document_guid: "806608ed-d2b4-4f83-8b22-739d5223c56f",
          exp_document_name: "OMS Manual",
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          req_document_guid: "c95886bc-e4b2-4743-b38d-42eea858e9ee",
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: "9999-12-31",
      },
    },
    "18145c75-49ad-0101-85f3-a43e45ae989a": {
      guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      mgr_appointment: [],
      mine_permit: [
        {
          expiry_date: "9999-12-31",
          issue_date: "9999-12-31",
          mine_guid: "1628847c-060b-45f2-990f-815877174801",
          permit_guid: "2ec66cff-dbf0-4e4b-b9b8-9c7740ba8c81",
          permit_no: "KNaaWwVdiJ40",
          permit_status_code: "Z",
          permittee: [
            {
              effective_date: "2018-10-02",
              expiry_date: "9999-12-31",
              party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
              party_name: "Yivihoke",
              permit_guid: "2ec66cff-dbf0-4e4b-b9b8-9c7740ba8c81",
              permittee_guid: "abd4c8bb-48ac-4ec2-b296-5f38d4118176",
              party: {
                effective_date: "2018-10-03",
                email: "JgHxeyjv@aezZIwee.com",
                expiry_date: "9999-12-31",
                first_name: "Tiyudoveh",
                name: "Tiyudoveh Higesewawa",
                party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
                party_name: "Higesewawa",
                party_type_code: "PER",
                phone_ext: null,
                phone_no: "123-123-1234",
              },
            },
          ],
        },
        {
          expiry_date: "9999-12-31",
          issue_date: "9999-12-31",
          mine_guid: "1628847c-060b-45f2-990f-815877174801",
          permit_guid: "1877097f-bf9d-40c8-a5fa-53d9a79623c9",
          permit_no: "xfM0c0ZKEw7B",
          permit_status_code: "Z",
          permittee: [
            {
              effective_date: "2018-10-02",
              expiry_date: "9999-12-31",
              party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
              party_name: "Yivihoke",
              permit_guid: "1877097f-bf9d-40c8-a5fa-53d9a79623c9",
              permittee_guid: "3491c9a5-8f09-471f-bb1b-3ea246eb9796",
              party: {
                effective_date: "2018-10-03",
                email: "JgHxeyjv@aezZIwee.com",
                expiry_date: "9999-12-31",
                first_name: "Tiyudoveh",
                name: "Tiyudoveh Higesewawa",
                party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
                party_name: "Higesewawa",
                party_type_code: "PER",
                phone_ext: null,
                phone_no: "123-123-1234",
              },
            },
          ],
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
        expiry_date: "9999-12-31",
      },
      mine_detail: [
        {
          mine_name: "mine1",
          mine_no: "BLAH9091",
          region_code: "NE",
        },
        {
          mine_name: "mine2",
          mine_no: "BLAH9091",
          region_code: "NE",
        },
      ],
      mine_location: [
        {
          longitude: null,
          latitude: null,
        },
      ],
      mine_tailings_storage_facility: [
        {
          mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f34",
          mine_tailings_storage_facility_name: "MockTSF1",
        },
      ],
      mine_expected_documents: [
        {
          date_created: "2018-11-19",
          due_date: "None",
          exp_document_guid: "806608ed-d2b4-4f83-8b22-739d5223c56f",
          exp_document_name: "OMS Manual",
          mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
          req_document_guid: "c95886bc-e4b2-4743-b38d-42eea858e9ee",
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
    },
  },
};

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
};

export const MINE_NAME_LIST = [
  {
    guid: "fc72863d-83e8-46ba-90f9-87b0ed78823f",
    mine_name: "New Mine",
    mine_no: "BLAH6194",
    longitude: "-119.6963833",
    latitude: "51.4961750",
  },
  {
    guid: "89a65274-581d-4862-8630-99f5f7687089",
    mine_name: "Mine Two",
    mine_no: "BLAH0502",
    longitude: "-119.6963833",
    latitude: "51.4961750",
  },
  {
    guid: "75692b61-7ab9-406b-b1f5-8c9b857404ac",
    mine_name: "Legit Mine",
    mine_no: "BLAH6734",
    longitude: "-119.6963833",
    latitude: "51.4961750",
  },
];

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

export const TENURE_TYPES = {
  options: [
    { value: 1, label: "Coal" },
    { value: 2, label: "Mineral" },
    { value: 3, label: "Placer" },
    { value: 4, label: "BC Land" },
  ],
};

export const TENURE_HASH = {
  1: "Coal",
  2: "Mineral",
  3: "Placer",
  4: "BC Land",
};

export const PERMITTEE = {
  permitteeIds: ["1c7da2c4-10d5-4c9f-994a-96427aa0c69b"],
  permittees: {
    "1c7da2c4-10d5-4c9f-994a-96427aa0c69b": {
      effective_date: "2018-10-02",
      expiry_date: "9999-12-31",
      party_guid: "1c7da2c4-10d5-4c9f-994a-96427aa0c69b",
      party_name: "Yivihoke",
      permit_guid: "1877097f-bf9d-40c8-a5fa-53d9a79623c9",
      permittee_guid: "3491c9a5-8f09-471f-bb1b-3ea246eb9796",
      party: {
        effective_date: "2018-10-03",
        email: "JgHxeyjv@aezZIwee.com",
        expiry_date: "9999-12-31",
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
    { value: "22ea095d-ba50-4691-9384-3474ed75da68", label: "Not Received" },
    { value: "f98ea3af-9046-4c16-8543-f4eca759a1f1", label: "Received / Pending Review" },
    { value: "155330ff-5b2e-418a-b8f5-674a25cdcbac", label: "Review In Progress" },
    { value: "621a1e27-737a-4106-b92b-1c6c153c9d0a", label: "Accepted" },
    { value: "3358c881-f2b5-4f58-be41-a89f820302a0", label: "Rejected / Waiting On Update" },
  ],
};

export const MINE_TSF_REQUIRED_REPORTS_RESPONSE = {
  required_documents: [
    {
      req_document_guid: "05388944-afb3-4ef4-9db1-94db72f6060e",
      req_document_name: "Annual Reclamation",
      req_document_description: "10.4.4a",
      req_document_category: "MINE_TAILINGS",
    },
    {
      req_document_guid: "ca3f5a58-d7ea-4620-a064-507450f082de",
      req_document_name: "Annual DSI",
      req_document_description: "10.4.4b",
      req_document_category: "MINE_TAILINGS",
    },
    {
      req_document_guid: "faa99067-3639-4d9c-a3e5-5401df15ad4b",
      req_document_name: "5 year DSR",
      req_document_description: "10.5.4",
      req_document_category: "MINE_TAILINGS",
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
