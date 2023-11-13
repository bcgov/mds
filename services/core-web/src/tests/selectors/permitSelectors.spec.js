import { getEditingConditionFlag, getEditingPreambleFlag } from "@mds/common/redux/selectors/permitSelectors";
import { permitReducer } from "@mds/common/redux/reducers/permitReducer";
import { storeEditingConditionFlag, storeEditingPreambleFlag } from "@mds/common/redux/actions/permitActions";
import { PERMITS } from "@mds/common/constants/reducerTypes";

const mockFlagsResponse = false;

const mockState = {
  editingConditionFlag: false,
  editingPreambleFlag: false,
};

describe("permitSelectors", () => {
  const { editingConditionFlag, editingPreambleFlag } = mockState;

  it("`getEditingConditionFlag` calls `permitReducer.getEditingConditionFlag`", () => {
    const storeAction = storeEditingConditionFlag(mockFlagsResponse);
    const storeState = permitReducer({}, storeAction);
    const localMockState = {
      [PERMITS]: storeState,
    };
    expect(getEditingConditionFlag(localMockState)).toEqual(editingConditionFlag);
  });

  it("`getEditingPreambleFlag` calls `permitReducer.getEditingPreambleFlag`", () => {
    const storeAction = storeEditingPreambleFlag(mockFlagsResponse);
    const storeState = permitReducer({}, storeAction);
    const localMockState = {
      [PERMITS]: storeState,
    };
    expect(getEditingPreambleFlag(localMockState)).toEqual(editingPreambleFlag);
  });
});
