import React from "react";
import { shallow } from "enzyme";
import { SearchBarDropdown } from "@/components/search/SearchBarDropdown";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.searchBarResults = MOCK.SIMPLE_SEARCH_RESULTS.search_results;
  [reducerProps.searchTerm] = MOCK.SIMPLE_SEARCH_RESULTS.search_terms;
  reducerProps.searchTermHistory = [""];
  reducerProps.history = {
    push: jest.fn(),
    location: {},
  };
};

beforeEach(() => {
  setupReducerProps();
});

describe("SearchBarDropdown", () => {
  it("renders properly", () => {
    const component = shallow(<SearchBarDropdown {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
