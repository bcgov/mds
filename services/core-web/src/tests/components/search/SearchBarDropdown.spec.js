import React from "react";
import { shallow } from "enzyme";
import { SearchBarDropdown } from "@/components/search/SearchBarDropdown";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

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
//  React.Children.only expected to receive a single React element child.
// The above error occurred in the <Dropdown> component:
//         in Dropdown (created by SearchBarDropdown)
//         in SearchBarDropdown
describe("SearchBarDropdown", () => {
  it("renders properly", () => {
    const component = shallow(<SearchBarDropdown {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
