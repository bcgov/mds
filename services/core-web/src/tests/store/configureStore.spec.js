import { rootReducer } from "@/reducers/rootReducer";
import { configureStore } from "@reduxjs/toolkit";
import getStore from "@/store/configureStore";

const mockDevStore = configureStore({ reducer: rootReducer });
const mockProdStore = configureStore({ reducer: rootReducer });

describe("configureStore", () => {
  it("returns production store", () => {
    const store = getStore();
    expect(store.getState()).toEqual(mockDevStore.getState());
  });

  it("returns dev store", () => {
    process.env.NODE_ENV = "development";
    const store = getStore();
    expect(store.getState()).toEqual(mockProdStore.getState());
  });
});
