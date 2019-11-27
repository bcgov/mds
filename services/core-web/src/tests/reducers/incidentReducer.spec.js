import incidentReducer from "@/reducers/incidentReducer";
import { storeIncidents, storeMineIncidents } from "@/actions/incidentActions";
import * as Mocks from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  incidents: [],
  incidentPageData: {},
  mineIncidents: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("incidentReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = incidentReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_INCIDENTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.mineIncidents = Mocks.INCIDENTS.records;
    const result = incidentReducer(undefined, storeMineIncidents(Mocks.INCIDENTS));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_INCIDENTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.incidents = Mocks.INCIDENTS.records;
    expectedValue.incidentPageData = Mocks.INCIDENTS;
    const result = incidentReducer(undefined, storeIncidents(Mocks.INCIDENTS));
    expect(result).toEqual(expectedValue);
  });
});
