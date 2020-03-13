import { getReports } from "@common/selectors/reportSelectors";
import { reportReducer } from "@common/reducers/reportReducer";
import { storeReports } from "@common/actions/mineReportActions";
import { REPORTS } from "@common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  reports: Mock.MINE_REPORTS,
  reportsPageData: Mock.REPORTS_PAGE_DATA,
  mineReports: [],
  reportComments: [],
  commentsLoading: true,
  commentSubmitting: false,
};

describe("reportSelectors", () => {
  const { reports } = mockState;

  it("`getReports` calls `reportReducer.getReports` when `storeReports` is dispatched", () => {
    const storeAction = storeReports(Mock.MINE_REPORT_RESPONSE);
    const storeState = reportReducer({}, storeAction);
    const localMockState = {
      [REPORTS]: storeState,
    };
    expect(getReports(localMockState)).toEqual(reports);
  });
});
