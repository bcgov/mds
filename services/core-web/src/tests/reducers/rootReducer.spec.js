import { createStore } from "redux";
import { authenticateUser } from "@mds/common/redux/actions/authenticationActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import { rootReducer, reducerObject } from "@/reducers/rootReducer";
import * as ROUTES from "../../constants/routes";

describe("Store", () => {
  beforeEach(() => {
    global.GLOBAL_ROUTES = ROUTES;
  });
  it("should handle reducer creation", () => {
    const store = createStore(rootReducer, reducerObject);

    const action = authenticateUser({});
    store.dispatch(action);

    const actual = store.getState()[reducerTypes.AUTHENTICATION];
    const expected = {
      isAuthenticated: true,
      userInfo: { preferred_username: undefined },
      userAccessData: [],
    };

    expect(actual).toEqual(expected);
  });
});
