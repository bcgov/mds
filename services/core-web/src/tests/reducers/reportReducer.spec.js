import { reportReducer } from "@mds/common/redux/reducers/reportReducer";
import { storeMineReports, storeReports } from "@mds/common/redux/actions/mineReportActions";
import * as Mocks from "@mds/common/tests/mocks/dataMocks";

const baseExpectedValue = {
  reports: [],
  reportsPageData: {},
  mineReportGuid: "",
  mineReports: [],
  reportComments: [],
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
    expectedValue.mineReports = Mocks.MINE_REPORT_RESPONSE.records;
    expectedValue.reportsPageData = Mocks.MINE_REPORT_RESPONSE;
    const result = reportReducer(undefined, storeMineReports(Mocks.MINE_REPORT_RESPONSE));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_REPORTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.reports = Mocks.REPORTS_PAGE_DATA.records;
    expectedValue.reportsPageData = Mocks.REPORTS_PAGE_DATA;
    const result = reportReducer(undefined, storeReports(Mocks.REPORTS_PAGE_DATA));
    expect(result).toEqual(expectedValue);
  });
});
