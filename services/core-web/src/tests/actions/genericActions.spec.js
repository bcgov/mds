import configureStore from "redux-mock-store";
import { request, success, error } from "@mds/common/redux/actions/genericActions";
import * as ActionTypes from "@mds/common/constants/actionTypes";

/* 
Testing against action `createMineRecord` arbitrarily.
The genericActions includes: request, success, and error. 
They are used in every network action.
*/
const initialState = {
  CREATE_MINE_RECORD: {
    data: [],
    errorMessage: [],
    isFetching: false,
    success: false,
  },
};
const mockStore = configureStore();
const store = mockStore(initialState);

describe("genericActions", () => {
  afterEach(() => {
    store.clearActions();
  });

  it("`request action` returns `type: REQUEST`", () => {
    const expectedActions = [{ name: "CREATE_MINE_RECORD", type: ActionTypes.REQUEST }];

    store.dispatch(request("CREATE_MINE_RECORD"));
    expect(store.getActions()).toEqual(expectedActions);
  });

  describe("after a `request` action", () => {
    it("when an API endpoint has been successful, the `success` action returns `type: SUCCESS`", () => {
      const mockData = {};
      const expectedActions = [
        { name: "CREATE_MINE_RECORD", type: ActionTypes.REQUEST },
        { name: "CREATE_MINE_RECORD", type: ActionTypes.SUCCESS, data: mockData },
      ];

      store.dispatch(request("CREATE_MINE_RECORD"));
      store.dispatch(success("CREATE_MINE_RECORD", mockData));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it("when an API endpoint has failed, the `error` action returns `type: ERROR`", () => {
      const mockError = {
        response: { status: 400, data: { errors: [], message: ActionTypes.ERROR } },
      };
      const expectedActions = [
        { name: "CREATE_MINE_RECORD", type: ActionTypes.REQUEST },
        { name: "CREATE_MINE_RECORD", type: ActionTypes.ERROR, errorMessage: mockError },
      ];
      store.dispatch(request("CREATE_MINE_RECORD"));
      store.dispatch(error("CREATE_MINE_RECORD", mockError));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
