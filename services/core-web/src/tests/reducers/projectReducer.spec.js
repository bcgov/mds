import { projectReducer } from "@common/reducers/projectReducer";
import { storeProjectSummaries, storeProjectSummary } from "@common/actions/projectActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  projectSummaries: [],
  projectSummary: {},
  projectSummaryPageData: {},
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("projectReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = projectReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PROJECT_SUMMARIES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.projectSummaries = MOCK.PROJECT_SUMMARIES.records;
    expectedValue.projectSummaryPageData = MOCK.PROJECT_SUMMARIES;
    const result = projectReducer(undefined, storeProjectSummaries(MOCK.PROJECT_SUMMARIES));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PROJECT_SUMMARY", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.projectSummary = MOCK.PROJECT_SUMMARY;
    const result = projectReducer(undefined, storeProjectSummary(MOCK.PROJECT_SUMMARY));
    expect(result).toEqual(expectedValue);
  });
});
