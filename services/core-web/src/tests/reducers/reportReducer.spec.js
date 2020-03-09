import { reportReducer } from "@common/reducers/reportReducer";
import { storeMineReports } from "@common/actions/mineReportActions";
import * as Mocks from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  reports: [],
  reportsPageData: {},
  mineReports: [],
  reportComments: [],
  commentsLoading: true,
  commentSubmitting: false,
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("reportReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = reportReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_REPORTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineReports = Mocks.MINE_REPORTS;
    const result = reportReducer(undefined, storeMineReports(Mocks.MINE_REPORT_RESPONSE));
    expect(result).toEqual(expectedValue);
  });
});
