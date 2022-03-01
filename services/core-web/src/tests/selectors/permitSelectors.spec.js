import { getEditingConditionFlag, getEditingPreambleFlag } from "@common/selectors/permitSelectors";
import { permitReducer } from "@common/reducers/permitReducer";
import { storeEditingConditionFlag, storeEditingPreambleFlag } from "@common/actions/permitActions";
import { PERMITS } from "@common/constants/reducerTypes";

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
