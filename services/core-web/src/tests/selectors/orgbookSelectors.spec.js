import { getBCRegistrationSearchResults, getOrgBookCredential } from "@mds/common/redux/selectors/orgbookSelectors";
import { orgbookReducer } from "@mds/common/redux/reducers/orgbookReducer";
import { storeBCRegistrationResults, storeOrgBookCredential } from "@mds/common/redux/actions/orgbookActions";
import { ORGBOOK } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

describe("getBCRegistrationSearchResults", () => {
  it("`getBCRegistrationSearchResults` calls `orgbookReducer.getBCRegistrationSearchResults`", () => {
    const storeAction = storeBCRegistrationResults(MOCK.ORGBOOK_SEARCH_RESULTS);
    const storeState = orgbookReducer({}, storeAction);
    const mockState = {
      [ORGBOOK]: storeState,
    };

    expect(getBCRegistrationSearchResults(mockState)).toEqual(MOCK.ORGBOOK_SEARCH_RESULTS);
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
