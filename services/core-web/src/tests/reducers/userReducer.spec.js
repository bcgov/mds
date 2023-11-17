import { userReducer } from "@mds/common/redux/reducers/userReducer";
import { storeCoreUserList } from "@mds/common/redux/actions/userActions";
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
    expectedValue.coreUsers = MOCK.INSPECTORS.results;
    const result = userReducer(undefined, storeCoreUserList(MOCK.INSPECTORS));
    expect(result).toEqual(expectedValue);
  });
});
