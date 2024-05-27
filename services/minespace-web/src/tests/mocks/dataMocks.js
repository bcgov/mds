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
      mine_location: [{ longitude: null, latitude: null }],
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: "9999-12-31",
      },
      mine_tailings_storage_facilities: [
        {
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f78",
          mine_tailings_storage_facility_name: "MockTSF",
        },
      ],
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
    },
    {
      mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      mine_name: "mine2",
      mine_no: "BLAH9091",
      mine_region: "NE",
      mine_permit: [
        {
          authorization_end_date: "9999-12-31",
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
          authorization_end_date: "9999-12-31",
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
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: "9999-12-31",
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
      mine_type: [{ mine_tenure_type_code: "PLR" }, { mine_tenure_type_code: "MIN" }],
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
      mine_location: { longitude: null, latitude: null },
      mine_tailings_storage_facilities: [
        {
          mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
          mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f78",
          mine_tailings_storage_facility_name: "MockTSF",
          dams: [
            {
              dam_guid: "e2629897-053e-4218-9299-479375e47f78",
              dam_name: "MockDam",
              dam_type: "dam",
              latitude: "123",
              longitude: "123",
              operating_status: "operation",
              consequence_classification: "low",
              permitted_dam_crest_elevation: "123",
              current_dam_height: "123",
              current_elevation: "123",
              max_pond_elevation: "123",
              min_freeboard_required: "123",
            },
          ],
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
      mine_guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      mine_name: "mine2",
      mine_no: "BLAH9091",
      mine_region: "NE",
      mine_permit: [
        {
          authorization_end_date: "9999-12-31",
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
          authorization_end_date: "9999-12-31",
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
      mine_status: {
        statusvalue: ["CLD", "CM"],
        status_labels: ["Closed", "Care & Maintenance"],
        effective_date: "2018-10-16",
        expiry_date: "9999-12-31",
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

export const USER_MINE_INFO = [
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
              label: "Long-Term Maintenance",
            },
            {
              value: "LWT",
              label: "Long-Term Maintenance Water Treatment",
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
              label: "Long-Term Maintenance",
            },
            {
              value: "LWT",
              label: "Long-Term Maintenance Water Treatment",
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
          label: "Year-Round",
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
    { value: "COL", label: "Coal" },
    { value: "MIN", label: "Mineral" },
    { value: "PLR", label: "Placer" },
    { value: "BCL", label: "BC Land" },
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

export const USER_ACCESS_DATA = [
  "core_view_all",
  "idir",
  "core_edit_mine",
  "offline_access",
  "admin",
  "uma_authorization",
  "core_admin",
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

export const INCIDENT_CATEGORY_CODE_OPTIONS = [
  {
    value: "H&S",
    label: "Health and Safety",
  },
  {
    value: "GTC",
    label: "Geotechnical",
  },
  {
    value: "ENV",
    label: "Environmental",
  },
  {
    value: "SPI",
    label: "Spill",
  },
];

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
  orders: [
    {
      order_no: "1234-1",
      report_no: "1234",
      due_date: "",
      inspector: "TEST",
      violation: "2.2",
      overdue: false,
    },
    {
      order_no: "1234-2",
      report_no: "1234",
      due_date: "2019-12-31",
      inspector: "TEST",
      violation: "2.3",
      overdue: true,
    },
    {
      order_no: "1234-3",
      report_no: "1234",
      due_date: "",
      inspector: "TEST",
      violation: "1.1.1",
      overdue: false,
    },
  ],
  year_to_date: {
    num_inspections: 5,
  },
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
      expiry_date: "9999-12-31",
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
      expiry_date: "9999-12-31",
      party_name: "test dude 1 ",
      name: "test dude 1 ",
    },
    related_guid: "43f513af-1142-443b-a1e6-f14ef857f4ea",
  },
];

export const PARTYRELATIONSHIP = [
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
      expiry_date: "9999-12-31",
      party_name: "test company 2 ",
      name: "test company 2 ",
    },
    related_guid: "97b59b9c-8576-47cb-9a04-d7d0340730d5",
  },
];

export const PARTYRELATIONSHIPTYPES = [
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

export const VARIANCE_DOCUMENT_CATEGORY_OPTIONS = {
  records: [
    {
      variance_document_category_code: "REQ",
      description: "Request",
    },
    {
      variance_document_category_code: "REC",
      description: "Recommendation",
    },
    {
      variance_document_category_code: "DEC",
      description: "Decision",
    },
  ],
};

export const VARIANCE_DOCUMENT_CATEGORY_OPTIONS_DROPDOWN = [
  {
    value: "REQ",
    label: "Request Document",
  },
  {
    value: "REC",
    label: "Recommendation Document",
  },
  {
    value: "DEC",
    label: "Decision Document",
  },
];

export const VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH = {
  REQ: "Request Document",
  REC: "Recommendation Document",
  DEC: "Decision Document",
};

export const COMPLIANCE_CODES = {
  records: [
    {
      article_act_code: "HSRCM",
      compliance_article_id: "305",
      description: "Spills",
      effective_date: "1970-01-01",
      expiry_date: "9999-12-31",
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
      expiry_date: "9999-12-31",
      paragraph: "8",
      section: "2",
      sub_paragraph: null,
      sub_section: "3",
    },
  ],
};

export const DROPDOWN_HSRCM_CODES = [
  {
    value: "305",
    label: "2.3.7 - Spills",
  },
  {
    value: "306",
    label: "2.3.8 - Flammable Waste Storage",
  },
];

export const HSRCM_HASH = {
  305: "2.3.7 - Spills",
  306: "2.3.8 - Flammable Waste Storage",
};

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

export const VARIANCE = {
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
};

export const MINE_WORK_INFORMATIONS = [
  {
    created_by: "test",
    created_timestamp: "2021-08-23",
    mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
    mine_work_information_guid: "c3cf9330-1b4c-4da2-a0f4-47b2aa834c3d",
    mine_work_information_id: 4,
    updated_by: "test",
    updated_timestamp: "2021-08-23",
    work_comments: "test 2",
    work_start_date: "2021-08-24",
    work_status: "Not Working",
    work_stop_date: "2023-08-03",
  },
];

export const INCIDENT = {
  dangerous_occurrence_subparagraph_ids: [1747],
  determination_inspector_party_guid: "c002cc91-555a-4edd-9a9c-fcfee8357b00",
  determination_type_code: "DO",
  documents: [
    {
      document_manager_guid: "7b41c10c-4974-428d-a38a-ee3e8c4cee5a",
      document_name: "Amazing_PDF.pdf",
      mine_document_guid: "75855dd1-1f51-4fc1-835f-2dd99ea96f90",
      mine_incident_document_type_code: "INI",
    },
  ],
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
  mine_name: "Ponderosa",
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

export const PROJECTS = {
  records: [
    {
      project_guid: "8132462392222",
      mine_guid: "60300a07-376c-46f1-a984-88a813f91438",
      proponent_project_id: "Test-ID",
      project_summary: {},
      information_requirements_table: {
        irt_guid: "c16afb82-144c-4138-9a36-ba5c24c43d8a",
      },
      major_mine_application: {
        major_mine_application_guid: "c16afb82-144c-4138-9a36-ba5c24c43d8a",
      },
      contacts: [],
    },
  ],
};

export const PROJECT = {
  project_guid: "8132462392222",
  mine_guid: "60300a07-376c-46f1-a984-88a813f91438",
  proponent_project_id: "Test-ID",
  project_summary: {},
  information_requirements_table: {
    irt_guid: "c16afb82-144c-4138-9a36-ba5c24c43d8a",
    requirements: [
      {
        irt_requirements_xref_guid: "e2627ea7-1bcd-4df4-bba2-e1d96f6d4889",
        requirement_guid: "1ec24233-5a51-45bb-9fd8-ada055c13e87",
        deleted_ind: false,
        required: false,
        methods: false,
        comment: "Indigenous",
        version: 2,
      },
      {
        irt_requirements_xref_guid: "f3dd5aeb-b48d-4209-b7df-1fa773a3628f",
        requirement_guid: "a4d1f134-bd37-40d8-abb9-faec6c3d5ae0",
        deleted_ind: false,
        required: false,
        methods: false,
        comment: "Nation",
        version: 2,
      },
      {
        irt_requirements_xref_guid: "0dc94297-ff8e-4548-b903-9f75a3ebd060",
        requirement_guid: "c26cd541-642d-4cb5-985a-26c6e1bef26b",
        deleted_ind: false,
        required: false,
        methods: false,
        comment: "hello",
        version: 2,
      },
      {
        irt_requirements_xref_guid: "a3c1d302-c167-422e-9d39-ee8e19b56157",
        requirement_guid: "da1b8ff9-7a8b-4311-a6ab-0169f0070e5d",
        deleted_ind: false,
        required: false,
        methods: false,
        comment: "First",
        version: 2,
      },
      {
        irt_requirements_xref_guid: "9ceb3468-134c-4fd9-9596-cb1239f47e0f",
        requirement_guid: "e2c995d0-37ef-4588-ad91-76b6f2b07ab1",
        deleted_ind: false,
        required: false,
        methods: false,
        comment: "carp",
        version: 2,
      },
    ],
  },
  major_mine_application: {
    major_mine_application_guid: "c16afb82-144c-4138-9a36-ba5c24c43d8a",
  },
  contacts: [],
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
          status_code: "DFT",
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
      submission_date: "2021-11-19",
      project_summary_description: "Sample description.",
      documents: [],
    },
  ],
};

export const IRT_REQUIREMENTS = [
  {
    requirement_guid: "6b1c1113-a155-4584-aa6f-1284736b7d03",
    requirement_id: 1,
    parent_requirement_id: null,
    description: "Introduction and Project Overview",
    display_order: 1,
    deleted_ind: false,
    sub_requirements: [
      {
        requirement_guid: "fd197b05-8b5f-4578-9672-26f6909997b9",
        requirement_id: 10,
        parent_requirement_id: 1,
        description: "Application Background",
        display_order: 1,
        deleted_ind: false,
        sub_requirements: [],
        step: "1.1.",
        version: 1,
      },
      {
        requirement_guid: "2346a22a-a00e-43ba-a018-4c6da30ffd30",
        requirement_id: 11,
        parent_requirement_id: 1,
        description: "Proponent Information",
        display_order: 2,
        deleted_ind: false,
        sub_requirements: [],
        step: "1.2.",
        version: 1,
      },
      {
        requirement_guid: "cbc0cfd6-c29d-4936-aff7-b8e45de15e81",
        requirement_id: 12,
        parent_requirement_id: 1,
        description: "Project Overview",
        display_order: 3,
        deleted_ind: false,
        sub_requirements: [
          {
            requirement_guid: "42d10a71-2ce4-444a-bac7-4b01c286d9f2",
            requirement_id: 78,
            parent_requirement_id: 12,
            description: "Project History",
            display_order: 1,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.3.1.",
            version: 1,
          },
          {
            requirement_guid: "9289eefd-8902-4c1b-882e-1b15e57352b7",
            requirement_id: 79,
            parent_requirement_id: 12,
            description: "Overview of Products and Markets, and Projected Project Benefits",
            display_order: 2,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.3.2.",
            version: 1,
          },
          {
            requirement_guid: "b62e2e15-61f8-4779-9c69-d291a8ddc145",
            requirement_id: 80,
            parent_requirement_id: 12,
            description: "Location, Access and Land Use",
            display_order: 3,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.3.3.",
            version: 1,
          },
          {
            requirement_guid: "17dae1a6-01e2-4aca-bed5-f60a1c15757a",
            requirement_id: 81,
            parent_requirement_id: 12,
            description: "Mine Components and Off-Site Infrastructure",
            display_order: 4,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.3.4.",
            version: 1,
          },
          {
            requirement_guid: "70e5f5b7-69bd-4938-82b8-7d350123414c",
            requirement_id: 82,
            parent_requirement_id: 12,
            description: "Mine Development and Operations",
            display_order: 5,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.3.5.",
            version: 1,
          },
          {
            requirement_guid: "97111f1f-84a6-42ad-99f8-fa9d0dd3fcf9",
            requirement_id: 83,
            parent_requirement_id: 12,
            description: "Mine Design and Assessment Team",
            display_order: 6,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.3.6.",
            version: 1,
          },
          {
            requirement_guid: "e815386d-5397-4131-b8ae-3aece5e4b4a1",
            requirement_id: 84,
            parent_requirement_id: 12,
            description: "Spatial Data",
            display_order: 7,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.3.7.",
            version: 1,
          },
          {
            requirement_guid: "f3101f74-3b13-455e-8f92-0ef4ecbe6582",
            requirement_id: 85,
            parent_requirement_id: 12,
            description: "Concordance with Environmental Assessment Conditions",
            display_order: 8,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.3.8.",
            version: 1,
          },
        ],
        step: "1.3.",
        version: 1,
      },
      {
        requirement_guid: "aa44bc63-76ad-41c6-b0c3-393ae5c9f092",
        requirement_id: 13,
        parent_requirement_id: 1,
        description: "Regulatory Framework",
        display_order: 4,
        deleted_ind: false,
        sub_requirements: [],
        step: "1.4.",
        version: 1,
      },
      {
        requirement_guid: "c6096373-07c8-43b9-aded-aecc3c76d0fc",
        requirement_id: 14,
        parent_requirement_id: 1,
        description: "Indigenous Engagement",
        display_order: 5,
        deleted_ind: false,
        sub_requirements: [
          {
            requirement_guid: "7ed17fc8-748e-4b78-8a33-b6d524df6c8b",
            requirement_id: 86,
            parent_requirement_id: 14,
            description: "Background",
            display_order: 1,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.5.1.",
            version: 1,
          },
          {
            requirement_guid: "71f3b6f4-ad1e-4edc-b50d-e28bcf6955a0",
            requirement_id: 87,
            parent_requirement_id: 14,
            description: "Asserted and Established Rights and Interests",
            display_order: 2,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.5.2.",
            version: 1,
          },
          {
            requirement_guid: "e121dbd5-d1a0-4644-87f9-b3c37dc8dde2",
            requirement_id: 88,
            parent_requirement_id: 14,
            description: "Engagement Efforts",
            display_order: 3,
            deleted_ind: false,
            sub_requirements: [],
            step: "1.5.3.",
            version: 1,
          },
        ],
        step: "1.5.",
        version: 1,
      },
    ],
    step: "1.",
    version: 1,
  },
  {
    requirement_guid: "ed015326-d824-4872-a5d2-02d398d1ec30",
    requirement_id: 3,
    parent_requirement_id: null,
    description: "Mine Plan",
    display_order: 3,
    deleted_ind: false,
    sub_requirements: [
      {
        requirement_guid: "fd991fdc-8d8d-4ea7-a8a8-5d0fd5a6c808",
        requirement_id: 27,
        parent_requirement_id: 3,
        description: "Mine Plan Overview",
        display_order: 1,
        deleted_ind: false,
        sub_requirements: [],
        step: "3.1.",
        version: 1,
      },
      {
        requirement_guid: "479c9c41-e71a-4fd7-880f-b2e57ba4c37e",
        requirement_id: 28,
        parent_requirement_id: 3,
        description: "Existing Development",
        display_order: 2,
        deleted_ind: false,
        sub_requirements: [],
        step: "3.2.",
        version: 1,
      },
      {
        requirement_guid: "acd2ce9e-cbd7-4804-813e-f4cb2ba52e5b",
        requirement_id: 29,
        parent_requirement_id: 3,
        description: "Life of Mine Plan",
        display_order: 3,
        deleted_ind: false,
        sub_requirements: [],
        step: "3.3.",
        version: 1,
      },
      {
        requirement_guid: "f2d8f5b4-4868-4870-b357-c151002de20c",
        requirement_id: 30,
        parent_requirement_id: 3,
        description: "Detailed Five Year Mine Plan",
        display_order: 4,
        deleted_ind: false,
        sub_requirements: [],
        step: "3.4.",
        version: 1,
      },
      {
        requirement_guid: "e6d36435-8348-41b6-b857-32607643d2cb",
        requirement_id: 31,
        parent_requirement_id: 3,
        description: "Mine Facility Designs and Development",
        display_order: 5,
        deleted_ind: false,
        sub_requirements: [
          {
            requirement_guid: "bf469a79-258c-4022-917d-b8ebd6e1958a",
            requirement_id: 101,
            parent_requirement_id: 31,
            description: "Open Pits",
            display_order: 1,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.1.",
            version: 1,
          },
          {
            requirement_guid: "5d6d6b07-9012-4dc8-b816-fd75712eb36b",
            requirement_id: 102,
            parent_requirement_id: 31,
            description: "Underground Workings",
            display_order: 2,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.2.",
            version: 1,
          },
          {
            requirement_guid: "6095451b-e4a1-42ec-bbab-da371e873899",
            requirement_id: 103,
            parent_requirement_id: 31,
            description: "Processing Plant (Mill) and Associated Facilities",
            display_order: 3,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.3.",
            version: 1,
          },
          {
            requirement_guid: "77c7931b-e621-47b2-8007-be08a1e663cd",
            requirement_id: 104,
            parent_requirement_id: 31,
            description: "Tailings Storage Facility and Associated Infrastructure",
            display_order: 4,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.4.",
            version: 1,
          },
          {
            requirement_guid: "ec2a91b2-04ad-4f6b-9fad-ca8b56d65299",
            requirement_id: 105,
            parent_requirement_id: 31,
            description: "Waste Rock Dumps",
            display_order: 5,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.5.",
            version: 1,
          },
          {
            requirement_guid: "d8efa027-3a4e-4fdb-b8bd-117216d9efb8",
            requirement_id: 106,
            parent_requirement_id: 31,
            description: "Water Management Structures",
            display_order: 6,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.6.",
            version: 1,
          },
          {
            requirement_guid: "91500a44-957b-458a-b479-0a9e48593617",
            requirement_id: 107,
            parent_requirement_id: 31,
            description: "Ore, Overburden, Soil and Construction Stockpiles",
            display_order: 7,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.7.",
            version: 1,
          },
          {
            requirement_guid: "eadadb8e-5c6d-4251-a878-3e3010a6db11",
            requirement_id: 108,
            parent_requirement_id: 31,
            description: "Mine Access and Mine Haulage Roads",
            display_order: 8,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.8.",
            version: 1,
          },
          {
            requirement_guid: "da890f5f-c8e8-4af4-aa90-34c3bf34c9b6",
            requirement_id: 109,
            parent_requirement_id: 31,
            description: "Power Supply and Distribution Infrastructure",
            display_order: 9,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.9.",
            version: 1,
          },
          {
            requirement_guid: "5e32f9e3-7cbe-4a4e-8c7f-dc99919dcc73",
            requirement_id: 110,
            parent_requirement_id: 31,
            description: "Explosives Storage Facilities",
            display_order: 10,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.10.",
            version: 1,
          },
          {
            requirement_guid: "0f9eebdd-b8ba-4148-981a-e0f82cdd5961",
            requirement_id: 111,
            parent_requirement_id: 31,
            description: "Ancillary Facilities and Support Infrastructure",
            display_order: 11,
            deleted_ind: false,
            sub_requirements: [],
            step: "3.5.11.",
            version: 1,
          },
        ],
        step: "3.5.",
        version: 1,
      },
    ],
    step: "3.",
    version: 1,
  },
];

export const INFORMATION_REQUIREMENTS_TABLE = {
  irt_guid: "c16afb82-144c-4138-9a36-ba5c24c43d8a",
  project_guid: "66d7e698-8820-456f-ac32-14917f3ebe88",
  status_code: "SUB",
  requirements: [
    {
      requirement_guid: "1b9916df-b747-4074-a2ef-88b8921cabd0",
      required: true,
      methods: true,
      comment: "Comments in Application Background 2",
    },
    {
      requirement_guid: "4ca346da-6727-4f4e-90cb-4d4d9c6fde1d",
      required: true,
      methods: true,
      comment: "Comments in Proponent Information 2",
    },
  ],
  documents: [],
};

export const INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_HASH = {
  DFT: "Draft",
  SUB: "Submitted",
  UNR: "In Review",
  APV: "Review Complete",
  CHR: "Change Requested",
};

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

export const PROJECT_SUMMARY = {
  mine_guid: "60300a07-376c-46f1-a984-88a813f91438",
  project_summary_guid: "81324623978135",
  status_code: "OPN",
  submission_date: "2021-11-19",
  project_summary_description: "Sample description.",
  documents: [],
};

export const PROJECT_SUMMARY_STATUS_CODES_HASH = {
  OPN: "Open",
  CLD: "Closed",
  WDN: "Withdrawn",
};

export const PROJECT_SUMMARY_DOCUMENT_TYPES_HASH = {
  GEN: "General",
};

export const PERMITS = {
  permits: [
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
          preamble_text: "",
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
          preamble_text: "",
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
  ],
};

export const DRAFT_PERMIT = {
  draft_permits: [
    {
      permit_id: "283",
      permit_guid: "1628847c-060b-45f2-990f-815877174801",
      mine_guid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
      permit_no: "CX-DRAFT-11",
      permit_status_code: "D",
      assessed_liability_total: 8000000,
      confiscated_bond_total: 500,
      active_bond_total: 700,
      permit_amendments: [
        {
          permit_amendment_guid: "822310fd-3a2c-44a9-a9ce-dee81acc9585",
          permit_guid: "71d00d45-9fda-45d3-a4b0-59a7ceb6518e",
          permit_amendment_status_code: "DFT",
          permit_amendment_type_code: "OGP",
          received_date: null,
          issue_date: "2019-04-01",
          authorization_end_date: null,
          liability_adjustment: "1000000",
          description: "Initial permit issued.",
          preamble_text: "",
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
  ],
};

export const PERMIT_CONDITIONS = {
  permit_condition: {
    permit_condition_id: 15,
    permit_amendment_id: 1,
    permit_condition_guid: "86448b3e-611a-4872-a2a8-b1b858fa1de5",
    condition: "Approved Activities:",
    condition_type_code: "GEC",
    condition_category_code: "CON",
    parent_permit_condition_id: 14,
    sub_conditions: [{}],
    step: "string",
    display_order: 0,
  },
};

export const STANDARD_PERMIT_CONDITIONS = {
  standard_permit_condition: {
    standard_permit_condition_id: 15,
    standard_permit_condition_guid: "28b09476-31de-440a-8457-e091ca10e093",
    notice_of_work_type: "SAG",
    condition: "Reclamation Security",
    condition_category_code: "RCC",
    condition_type_code: "SEC",
    parent_permit_condition_id: null,
    all_sub_conditions: [
      {
        standard_permit_condition_id: 87,
        notice_of_work_type: "SAG",
        standard_permit_condition_guid: "20b1994e-a6be-4a85-a3d8-8c255246ad83",
        condition:
          "[X dollars] $<<bond_amt>> in security must be maintained with the Minister of Finance.",
        condition_type_code: "CON",
        condition_category_code: "RCC",
        parent_permit_condition_id: 15,
        sub_conditions: [{}],
        step: null,
        deleted_ind: false,
        display_order: 1,
      },
      {
        standard_permit_condition_id: 88,
        notice_of_work_type: "SAG",
        standard_permit_condition_guid: "fcf013ab-ab4b-4be0-847a-250576654b99",
        condition:
          "The security must be deposited in accordance with the following installment schedule:",
        condition_type_code: "CON",
        condition_category_code: "RCC",
        parent_permit_condition_id: 15,
        sub_conditions: [],
        step: null,
        deleted_ind: false,
        display_order: 2,
      },
    ],
    step: null,
    display_order: 1,
    create_user: "system-mds",
    create_timestamp: "2021-07-29 20:23:16Z",
    update_user: "system-mds",
    update_timestamp: "2021-07-29 20:23:16Z",
  },
};

export const NOTICES_OF_DEPARTURE = {
  records: [
    {
      nod_guid: "4ca454f5-7982-4936-bfb9-84f5976fdefe",
      nod_no: "NOD-X-45564456-01",
      nod_title: "ff",
      nod_description: "some description",
      permit: {
        permit_id: 22,
        permit_guid: "d378ca4d-310a-4644-95cf-4d8dc47f294b",
        permit_no: "M-7594809",
        permit_status_code: "C",
        current_permittee: "Haynes, Park and Brown",
        permit_prefix: "M",
      },
    },
  ],
};

export const NOTICE_OF_DEPARTURE_DETAILS = {
  nod_guid: "56c75a01-248f-4e2c-961a-131790205682",
  nod_no: "NOD-X-45564456-01",
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

export const REGIONS = [
  {
    name: "Alberni-Clayoquot",
    regional_district_id: 4786586,
  },
  {
    name: "Bulkley-Nechako",
    regional_district_id: 4786587,
  },
  {
    name: "Capital",
    regional_district_id: 4786588,
  },
  {
    name: "Cariboo",
    regional_district_id: 4786590,
  },
  {
    name: "Central Coast",
    regional_district_id: 4786592,
  },
];
