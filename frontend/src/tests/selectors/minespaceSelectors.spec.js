import { getMinespaceUsers } from "@/selectors/minespaceSelector";
import minespaceReducer from "@/reducers/minespaceReducer";
import { storeMinespaceUserList } from "@/actions/minespaceActions";
import { MINESPACE } from "@/constants/reducerTypes";
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
