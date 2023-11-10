import { getSearchOrgBookResults, getOrgBookCredential } from "@mds/common/redux/selectors/orgbookSelectors";
import { orgbookReducer } from "@mds/common/redux/reducers/orgbookReducer";
import { storeSearchOrgBookResults, storeOrgBookCredential } from "@mds/common/redux/actions/orgbookActions";
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
