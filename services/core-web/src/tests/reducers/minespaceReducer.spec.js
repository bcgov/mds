import { minespaceReducer } from "@mds/common/redux/reducers/minespaceReducer";
import {
  storeMinespaceUserList,
  storeMinespaceUserMineList,
} from "@mds/common/redux/actions/minespaceActions";

const baseExpectedValue = {
  minespaceUsers: [],
  minespaceUserMines: [],
  EMLIContacts: [],
  EMLIContactsByRegion: [],
};

const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("mineReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = minespaceReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINESPACE_USERS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.minespaceUsers = {
      email: "test@email.com",
      keycloak_guid: "",
      user_id: "1",
      mines: [],
    };
    const result = minespaceReducer(
      undefined,
      storeMinespaceUserList({
        records: {
          email: "test@email.com",
          keycloak_guid: "",
          user_id: "1",
          mines: [],
        },
        mines: [],
      })
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINESPACE_USERS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.minespaceUserMines = [
      {
        mine_guid: "ddcf354f-b871-4702-95b6-2ff7a0618e42",
        major_mine_ind: false,
        mine_name: "Johnson Hampton",
        mine_no: "B030601",
        mine_note: "",
        mine_permit: [],
        mine_status: [],
        mine_tailings_storage_facilities: [],
        mine_type: [],
        mine_region: "SW",
      },
    ];
    const result = minespaceReducer(
      undefined,
      storeMinespaceUserMineList([
        {
          mine_guid: "ddcf354f-b871-4702-95b6-2ff7a0618e42",
          major_mine_ind: false,
          mine_name: "Johnson Hampton",
          mine_no: "B030601",
          mine_note: "",
          mine_permit: [],
          mine_status: [],
          mine_tailings_storage_facilities: [],
          mine_type: [],
          mine_region: "SW",
        },
      ])
    );
    expect(result).toEqual(expectedValue);
  });
});
