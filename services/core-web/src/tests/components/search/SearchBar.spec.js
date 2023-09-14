import React from "react";
import { shallow } from "enzyme";
import { SearchBar } from "@/components/search/SearchBar";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchSearchBarResults = jest.fn();
  dispatchProps.clearSearchBarResults = jest.fn();
  dispatchProps.fetchSearchResults = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.searchBarResults = MOCK.SIMPLE_SEARCH_RESULTS;
  reducerProps.history = {
    push: jest.fn(),
    location: {},
  };
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("SearchBar", () => {
  it("renders properly", () => {
    const component = shallow(<SearchBar {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
