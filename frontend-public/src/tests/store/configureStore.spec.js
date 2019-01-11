import configureStore from "@/store/configureStore";
import { createStore, applyMiddleware } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import { rootReducer } from "@/reducers/rootReducer";

const mockDevStore = createStore(rootReducer, applyMiddleware(thunk, logger));
const mockProdStore = createStore(rootReducer, applyMiddleware(thunk));

describe("configureStore", () => {
  it("returns production store", () => {
    const store = configureStore();
    expect(store.getState()).toEqual(mockDevStore.getState());
  });

  it("returns dev store", () => {
    process.env.NODE_ENV = "development";
    const store = configureStore();
    expect(store.getState()).toEqual(mockProdStore.getState());
  });
});
