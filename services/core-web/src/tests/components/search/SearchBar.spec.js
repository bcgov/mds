import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import SearchBar from "@/components/search/SearchBar";
import * as MOCK from "@/tests/mocks/dataMocks";
import { store } from "@/App";

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
    const component = shallow(
      <Provider store={store}>
        <SearchBar {...dispatchProps} {...reducerProps} />
      </Provider>);
    expect(component).toMatchSnapshot();
  });
});
