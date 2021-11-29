import { projectSummaryReducer } from "@common/reducers/projectSummaryReducer";
import { storeProjectSummaries, storeProjectSummary } from "@common/actions/projectSummaryActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  projectSummaries: [],
  projectSummary: {},
  projectSummaryPageData: {},
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("projectSummaryReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = projectSummaryReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PROJECT_SUMMARIES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.projectSummaries = MOCK.PROJECT_SUMMARIES.records;
    expectedValue.projectSummaryPageData = MOCK.PROJECT_SUMMARIES;
    const result = projectSummaryReducer(undefined, storeProjectSummaries(MOCK.PROJECT_SUMMARIES));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PROJECT_SUMMARY", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.projectSummary = MOCK.PROJECT_SUMMARY;
    const result = projectSummaryReducer(undefined, storeProjectSummary(MOCK.PROJECT_SUMMARY));
    expect(result).toEqual(expectedValue);
  });
});
