import { createStore } from "redux";
import { authenticateUser } from "@mds/common/redux/actions/authenticationActions";
import * as reducerTypes from "@common/constants/reducerTypes";
import { rootReducer, reducerObject } from "@/reducers/rootReducer";

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
