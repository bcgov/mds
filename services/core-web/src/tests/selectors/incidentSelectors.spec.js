import { getMineIncidents, getIncidents } from "@common/selectors/incidentSelectors";
import { storeMineIncidents, storeIncidents } from "@common/actions/incidentActions";
import { incidentReducer } from "@common/reducers/incidentReducer";
import { INCIDENTS } from "@common/constants/reducerTypes";
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
