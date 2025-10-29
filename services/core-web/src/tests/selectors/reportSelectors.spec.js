import { getReports } from "@mds/common/redux/selectors/reportSelectors";
import reportSliceReducer, { storeReports } from "@mds/common/redux/slices/reportSlice";
import { REPORTS } from "@mds/common/constants/reducerTypes";
import * as Mock from "@mds/common/tests/mocks/dataMocks";

const mockState = {
  reports: Mock.MINE_REPORTS,
  reportsPageData: Mock.REPORTS_PAGE_DATA,
  mineReports: [],
  reportComments: [],
};

describe("reportSelectors", () => {
  const { reports } = mockState;

  it("`getReports` calls `reportReducer.getReports` when `storeReports` is dispatched", () => {
    const storeAction = storeReports(Mock.MINE_REPORT_RESPONSE);
    const storeState = reportSliceReducer(undefined, storeAction);
    const localMockState = {
      [REPORTS]: storeState,
    };
    expect(getReports(localMockState)).toEqual(reports);
  });
});
