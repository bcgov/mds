import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import SearchBar from "@/components/search/SearchBar";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { store } from "@/App";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchSearchBarResults = jest.fn();
  dispatchProps.clearSearchBarResults = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.searchBarResults = MOCK.SIMPLE_SEARCH_RESULTS;
  reducerProps.history = {
    push: jest.fn(),
    location: {},
  };
};

const props = {
  iconPlacement: "prefix",

}

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("SearchBar", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <Provider store={store}>
          <SearchBar {...dispatchProps} {...reducerProps} />
        </Provider>
      </BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
