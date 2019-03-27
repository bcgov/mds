import applicationReducer from "@/reducers/applicationReducer";
import { storeApplications } from "@/actions/applicationActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  applications: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("applicationReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();

    const result = applicationReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_APPLICATIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.applications = MOCK.APPLICATION_LIST;

    const result = applicationReducer(undefined, storeApplications(MOCK.APPLICATION_LIST));
    expect(result).toEqual(expectedValue);
  });
});
