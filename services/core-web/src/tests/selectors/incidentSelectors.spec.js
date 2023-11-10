import {
  getMineIncidents,
  getIncidents,
  getMineIncidentNotes,
} from "@mds/common/redux/selectors/incidentSelectors";
import {
  storeMineIncidents,
  storeIncidents,
  storeMineIncidentNotes,
} from "@mds/common/redux/actions/incidentActions";
import { incidentReducer } from "@mds/common/redux/reducers/incidentReducer";
import { INCIDENTS } from "@common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  mineIncidents: Mock.INCIDENTS.records,
  incidents: Mock.INCIDENTS.records,
  mineIncidentNotes: Mock.MINE_INCIDENT_NOTES.records,
};

describe("mineSelectors", () => {
  const { mineIncidents, incidents, mineIncidentNotes } = mockState;

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

  it("`storeMineIncidentNotes` calls `incidentReducer.getMineIncidentNotes`", () => {
    const storeAction = storeMineIncidentNotes(Mock.MINE_INCIDENT_NOTES);
    const storeState = incidentReducer({}, storeAction);
    const localMockState = {
      [INCIDENTS]: storeState,
    };
    expect(getMineIncidentNotes(localMockState)).toEqual(mineIncidentNotes);
  });
});
