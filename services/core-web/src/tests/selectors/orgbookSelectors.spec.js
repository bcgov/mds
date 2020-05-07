import { getSearchOrgBookResults, getOrgBookCredential } from "@common/selectors/orgbookSelectors";
import { orgbookReducer } from "@common/reducers/orgbookReducer";
import { storeSearchOrgBookResults, storeOrgBookCredential } from "@common/actions/orgbookActions";
import { ORGBOOK } from "@common/constants/reducerTypes";
import * as MOCK from "@/tests/mocks/dataMocks";

describe("getSearchOrgBookResults", () => {
  it("`getSearchOrgBookResults` calls `orgbookReducer.getSearchOrgBookResults`", () => {
    const storeAction = storeSearchOrgBookResults(MOCK.ORGBOOK_SEARCH_RESULTS);
    const storeState = orgbookReducer({}, storeAction);
    const mockState = {
      [ORGBOOK]: storeState,
    };

    expect(getSearchOrgBookResults(mockState)).toEqual(MOCK.ORGBOOK_SEARCH_RESULTS);
  });

  it("`getOrgBookCredential` calls `orgbookReducer.getOrgBookCredential`", () => {
    const storeAction = storeOrgBookCredential(MOCK.ORGBOOK_CREDENTIAL);
    const storeState = orgbookReducer({}, storeAction);
    const mockState = {
      [ORGBOOK]: storeState,
    };

    expect(getOrgBookCredential(mockState)).toEqual(MOCK.ORGBOOK_CREDENTIAL);
  });
});
