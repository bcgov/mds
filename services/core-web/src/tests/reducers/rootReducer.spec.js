import { createStore } from "redux";
import { authenticateUser } from "@common/actions/authenticationActions";
import { rootReducer, reducerObject } from "@/reducers/rootReducer";
import * as reducerTypes from "@/constants/reducerTypes";

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
