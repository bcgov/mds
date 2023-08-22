import { projectReducer } from "@common/reducers/projectReducer";
import {
  storeProjectSummaries,
  storeProjectSummary,
  storeRequirements,
  storeInformationRequirementsTable,
  storeMajorMinesApplication,
  storeProjectDecisionPackage,
} from "@common/actions/projectActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  projectSummaries: [],
  projectSummary: {},
  projectSummaryPageData: {},
  projects: [],
  project: {},
  projectPageData: {},
  informationRequirementsTable: {},
  requirements: [],
  majorMinesApplication: {},
  projectDecisionPackage: {},
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

  it("receives STORE_REQUIREMENTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.requirements = MOCK.REQUIREMENTS.records;
    const result = projectReducer(undefined, storeRequirements(MOCK.REQUIREMENTS));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_INFORMATION_REQUIREMENTS_TABLE", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.informationRequirementsTable = MOCK.INFORMATION_REQUIREMENTS_TABLE;
    const result = projectReducer(
      undefined,
      storeInformationRequirementsTable(MOCK.INFORMATION_REQUIREMENTS_TABLE)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MAJOR_MINES_APPLICATION", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.majorMinesApplication = MOCK.MAJOR_MINES_APPLICATION;
    const result = projectReducer(
      undefined,
      storeMajorMinesApplication(MOCK.MAJOR_MINES_APPLICATION)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_PROJECT_DECISION_PACKAGE", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.projectDecisionPackage = MOCK.PROJECT_DECISION_PACKAGE;
    const result = projectReducer(
      undefined,
      storeProjectDecisionPackage(MOCK.PROJECT_DECISION_PACKAGE)
    );
    expect(result).toEqual(expectedValue);
  });
});
