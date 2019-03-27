import { getApplications } from "@/selectors/applicationSelectors";
import applicationReducer from "@/reducers/applicationReducer";
import { storeApplications } from "@/actions/applicationActions";
import { APPLICATIONS } from "@/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockResponse = Mock.APPLICATION_LIST;
const mockState = {
  applications: Mock.APPLICATION_LIST,
};

describe("applicationSelectors", () => {
  const { applications } = mockState;

  it("`getMineComplianceInfo` calls `complianceReducer.getMineComplianceInfo`", () => {
    const storeAction = storeApplications(mockResponse);
    const storeState = applicationReducer({}, storeAction);
    const localMockState = {
      [APPLICATIONS]: storeState,
    };
    expect(getApplications(localMockState)).toEqual(applications);
  });
});
