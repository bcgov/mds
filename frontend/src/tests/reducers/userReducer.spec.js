import userReducer from "@/reducers/userReducer";
import { storeCoreUserList } from "@/actions/userActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  coreUsers: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("userReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = userReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_CORE_USERS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.coreUsers = MOCK.CORE_USERS.results;
    const result = userReducer(undefined, storeCoreUserList(MOCK.CORE_USERS));
    expect(result).toEqual(expectedValue);
  });
});
