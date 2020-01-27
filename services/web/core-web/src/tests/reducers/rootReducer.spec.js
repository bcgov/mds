import { createStore } from "redux";
import { rootReducer, reducerObject } from "@common/reducers/rootReducer";
import * as reducerTypes from "@/constants/reducerTypes";
import { authenticateUser } from "@common/actions/authenticationActions";

describe("Store", () => {
  it("should handle reducer creation", () => {
    const store = createStore(rootReducer, reducerObject);

    const action = authenticateUser({});
    store.dispatch(action);

    const actual = store.getState()[reducerTypes.AUTHENTICATION];
    const expected = { isAuthenticated: true, userInfo: {} };

    expect(actual).toEqual(expected);
  });
});
