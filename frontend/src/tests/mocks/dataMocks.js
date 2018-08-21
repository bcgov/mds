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
      ]
    },
    "18145c75-49ad-0101-85f3-a43e45ae989a": {
      guid: "18145c75-49ad-0101-85f3-a43e45ae989a",
      mgr_appointment: [],
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
      ]
    }
  }
}

export const PERSONNEL = {
  personnelIds: [
    "18133c75-49ad-4101-85f3-a43e35ae989a",
    "18145c75-49ad-0101-85f3-a43e45ae989a"
  ],
  personnel: {
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