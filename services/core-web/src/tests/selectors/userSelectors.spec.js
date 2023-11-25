import {
  getCoreUsers,
  getDropdownCoreUsers,
  getCoreUsersHash,
} from "@mds/common/redux/selectors/userSelectors";
import { userReducer } from "@mds/common/redux/reducers/userReducer";
import { storeCoreUserList } from "@mds/common/redux/actions/userActions";
import { USERS } from "@mds/common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  coreUsers: Mock.INSPECTORS.results,
};

describe("userSelectors", () => {
  const { coreUsers } = mockState;

  it("`getCoreUsers` calls `userReducer.getCoreUsers`", () => {
    const storeAction = storeCoreUserList(Mock.INSPECTORS);
    const storeState = userReducer({}, storeAction);
    const localMockState = {
      [USERS]: storeState,
    };
    expect(getCoreUsers(localMockState)).toEqual(coreUsers);
  });

  it("`getDropdownCoreUsers` calls `userReducer.getCoreUsers`", () => {
    const storeAction = storeCoreUserList(Mock.INSPECTORS);
    const storeState = userReducer({}, storeAction);
    const localMockState = {
      [USERS]: storeState,
    };
    expect(getDropdownCoreUsers(localMockState)).toEqual(Mock.INSPECTORS_DROPDOWN);
  });

  it("`getCoreUsersHash` calls `userReducer.getCoreUsers`", () => {
    const storeAction = storeCoreUserList(Mock.INSPECTORS);
    const storeState = userReducer({}, storeAction);
    const localMockState = {
      [USERS]: storeState,
    };
    expect(getCoreUsersHash(localMockState)).toEqual(Mock.INSPECTORS_HASH);
  });
});
