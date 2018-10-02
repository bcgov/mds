export const createMockHeader = () => ({
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Authorization': 'mockToken'
  }
});

export const MINES = {
  mineIds: [
    "18133c75-49ad-4101-85f3-a43e35ae989a",
    "18145c75-49ad-0101-85f3-a43e45ae989a"
  ],
  mines: {
    "18133c75-49ad-4101-85f3-a43e35ae989a": {
      guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      mgr_appointment: [],
      mine_permit: [],
      mine_permittee: [],
      mineral_tenure_xref: [
        {
          tenure_number_id: "1234567"
        }
      ],
      mine_detail: [
        {
          mine_name: "mine1",
          mine_no: "BLAH9091"
        },
        {
          mine_name: "mine3",
          mine_no: "BLAH9091"
        }
      ], 
      mine_location: [
        { longitude: null,
          latitude: null
        }
      ]
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
          permittee : [
            {
              effective_date: "2018-10-02",
              expiry_date: "9999-12-31",
              party_guid: "5a922021-6065-46b9-b67d-a3c897cabf73",
              party_name: "Yivihoke",
              permit_guid: "2ec66cff-dbf0-4e4b-b9b8-9c7740ba8c81",
              permittee_guid: "abd4c8bb-48ac-4ec2-b296-5f38d4118176",
            }
          ]
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
              party_guid: "5a922021-6065-46b9-b67d-a3c897cabf73",
              party_name: "Yivihoke",
              permit_guid: "1877097f-bf9d-40c8-a5fa-53d9a79623c9",
              permittee_guid: "3491c9a5-8f09-471f-bb1b-3ea246eb9796",
            }
          ]
        }
      ],
      mine_permittee: [],
      mineral_tenure_xref: [
        {
          tenure_number_id: "1234567"
        }
      ],
      mine_detail: [
        {
          mine_name: "mine1",
          mine_no: "BLAH9091"
        },
        {
          mine_name: "mine2",
          mine_no: "BLAH9091"
        }
      ],
      mine_location: [
        {
          longitude: null,
          latitude: null
        }
      ]
    }
  }
}

export const PARTY = {
  partyIds: [
    "18133c75-49ad-4101-85f3-a43e35ae989a",
    "18145c75-49ad-0101-85f3-a43e45ae989a"
  ],
  parties: {
    "18133c75-49ad-4101-85f3-a43e35ae989a": {
      guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
      full_name: "mock name"
    },
    "18145c75-49ad-0101-85f3-a43e45ae989a": {
      guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      full_name: "mock Two"
    }
  }
}

export const MINE_NAME_LIST = [
    {
      "guid": "fc72863d-83e8-46ba-90f9-87b0ed78823f",
      "mine_name": "New Mine",
      "mine_no": "BLAH6194",
      "longitude": '-119.6963833',
      "latitude": '51.4961750'
    },
    {
      "guid": "89a65274-581d-4862-8630-99f5f7687089",
      "mine_name": "Mine Two",
      "mine_no": "BLAH0502",
      "longitude": '-119.6963833',
      "latitude": '51.4961750'
    },
    {
      "guid": "75692b61-7ab9-406b-b1f5-8c9b857404ac",
      "mine_name": "Legit Mine",
      "mine_no": "BLAH6734",
      "longitude": '-119.6963833',
      "latitude": '51.4961750'
    }
  ]

export const PAGE_DATA = {
  "current_page": 1,
  "has_next": true,
  "has_prev":false,
  "items_per_page":25,
  "mines":[],
  "next_num":2,
  "prev_num":null,
  "total":9000,
  "total_pages":360,
}

export const COORDINATES = [48.70707, -122.489504]