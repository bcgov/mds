import { orgbookReducer } from "@mds/common/redux/reducers/orgbookReducer";
import { storeSearchOrgBookResults, storeOrgBookCredential } from "@mds/common/redux/actions/orgbookActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  searchOrgBookResults: [],
  orgBookCredential: {},
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("orgbookReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = orgbookReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_ORGBOOK_SEARCH_RESULTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.searchOrgBookResults = MOCK.ORGBOOK_SEARCH_RESULTS;

    const result = orgbookReducer(
      undefined,
      storeSearchOrgBookResults(MOCK.ORGBOOK_SEARCH_RESULTS)
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_ORGBOOK_CREDENTIAL", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.orgBookCredential = MOCK.ORGBOOK_CREDENTIAL;

    const result = orgbookReducer(undefined, storeOrgBookCredential(MOCK.ORGBOOK_CREDENTIAL));
    expect(result).toEqual(expectedValue);
  });
});
