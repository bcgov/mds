import { getMinespaceUsers } from "@common/selectors/minespaceSelector";
import { minespaceReducer } from "@common/reducers/minespaceReducer";
import { storeMinespaceUserList } from "@common/actions/minespaceActions";
import { MINESPACE } from "@common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockResponse = Mock.MINESPACE_RESPONSE;
const mockState = {
  minespaceUsers: Mock.MINESPACE_USERS,
};

describe("minespaceSelector", () => {
  const { minespaceUsers } = mockState;

  it("`getMinespaceUsers` calls `minespaceReducer.getMinespaceUsers`", () => {
    const storeAction = storeMinespaceUserList(mockResponse);
    const storeState = minespaceReducer({}, storeAction);
    const localMockState = {
      [MINESPACE]: storeState,
    };
    expect(getMinespaceUsers(localMockState)).toEqual(minespaceUsers);
  });
});
