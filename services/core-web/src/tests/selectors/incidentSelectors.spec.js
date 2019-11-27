import { getMineIncidents, getIncidents } from "@/selectors/incidentSelectors";
import { storeMineIncidents, storeIncidents } from "@/actions/incidentActions";
import incidentReducer from "@/reducers/incidentReducer";
import { INCIDENTS } from "@/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  mineIncidents: Mock.INCIDENTS.records,
  incidents: Mock.INCIDENTS.records,
};

describe("mineSelectors", () => {
  const { mineIncidents, incidents } = mockState;

  it("`getMineIncidents` calls `incidentReducer.getMineIncidents`", () => {
    const storeAction = storeMineIncidents(Mock.INCIDENTS);
    const storeState = incidentReducer({}, storeAction);
    const localMockState = {
      [INCIDENTS]: storeState,
    };
    expect(getMineIncidents(localMockState)).toEqual(mineIncidents);
  });

  it("`storeIncidents` calls `incidentReducer.getIncidents`", () => {
    const storeAction = storeIncidents(Mock.INCIDENTS);
    const storeState = incidentReducer({}, storeAction);
    const localMockState = {
      [INCIDENTS]: storeState,
    };
    expect(getIncidents(localMockState)).toEqual(incidents);
  });
});
