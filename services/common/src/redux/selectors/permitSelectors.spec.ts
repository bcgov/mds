import {
  formatPermit,
  getEditingConditionFlag,
  getEditingPreambleFlag,
  getLatestAmendmentByPermitGuid,
  getPermitByGuid,
} from "@mds/common/redux/selectors/permitSelectors";
import { permitReducer } from "@mds/common/redux/reducers/permitReducer";
import {
  storeEditingConditionFlag,
  storeEditingPreambleFlag,
} from "@mds/common/redux/actions/permitActions";
import { PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { RootState } from "../rootState";

const mockFlagsResponse = false;

const mockState = {
  editingConditionFlag: false,
  editingPreambleFlag: false,
};

const mockPermits = MOCK.PERMITS;
describe("permitSelectors", () => {
  const { editingConditionFlag, editingPreambleFlag } = mockState;

  it("`getEditingConditionFlag` calls `permitReducer.getEditingConditionFlag`", () => {
    const storeAction = storeEditingConditionFlag(mockFlagsResponse);
    const storeState = permitReducer({} as any, storeAction);
    const localMockState = {
      [PERMITS]: storeState,
    };
    expect(getEditingConditionFlag(localMockState as RootState)).toEqual(editingConditionFlag);
  });

  it("`getEditingPreambleFlag` calls `permitReducer.getEditingPreambleFlag`", () => {
    const storeAction = storeEditingPreambleFlag(mockFlagsResponse);
    const storeState = permitReducer({} as any, storeAction);
    const localMockState = {
      [PERMITS]: storeState,
    };
    expect(getEditingPreambleFlag(localMockState as RootState)).toEqual(editingPreambleFlag);
  });
  it("getPermitByGuid returns the correct permit", () => {
    const localMockState = {
      [PERMITS]: { permits: mockPermits },
    };
    const permit = formatPermit(MOCK.PERMITS[1]);
    const actual = getPermitByGuid(permit.permit_guid)(localMockState as RootState);
    expect(actual).toEqual(permit);
  });
  it("`getLatestAmendmentByPermitGuid returns the latest permit amendment", () => {
    const localMockState = {
      [PERMITS]: { permits: mockPermits },
    };
    const permit = MOCK.PERMITS[0];
    const latestAmendment = getLatestAmendmentByPermitGuid(permit.permit_guid)(
      localMockState as RootState
    );

    expect(latestAmendment).toEqual(MOCK.PERMITS[0].permit_amendments[0]);
  });
});
