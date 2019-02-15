import minespaceReducer from "@/reducers/minespaceReducer";
import { storeMinespaceUserList } from "@/actions/minespaceActions";

const baseExpectedValue = {
  minespaceUsers: [],
  minespaceUserMines: [],
};

const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("mineReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = minespaceReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINESPACE_USERS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.minespaceUsers = {
      email: "test@email.com",
      keycloak_guid: "",
      user_id: "1",
      mines: [],
    };
    const result = minespaceReducer(
      undefined,
      storeMinespaceUserList({
        users: {
          email: "test@email.com",
          keycloak_guid: "",
          user_id: "1",
          mines: [],
        },
        mines: [],
      })
    );
    expect(result).toEqual(expectedValue);
  });
});
