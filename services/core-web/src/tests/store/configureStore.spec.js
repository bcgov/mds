import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { rootReducer } from "@/reducers/rootReducer";
import configureStore from "@/store/configureStore";

const mockDevStore = createStore(rootReducer, applyMiddleware(thunk));
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
