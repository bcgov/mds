import React from "react";
import { shallow } from "enzyme";
import { SearchResults } from "@/components/search/SearchResults";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchSearchOptions = jest.fn();
  dispatchProps.fetchPartyRelationshipTypes = jest.fn();
  dispatchProps.fetchSearchResults = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.searchOptions = MOCK.SEARCH_OPTIONS;
  reducerProps.searchResults = MOCK.SEARCH_RESULTS;
  reducerProps.searchTerms = ["Abb"];
  reducerProps.partyRelationshipTypeHash = MOCK.MINE_INFO_HASH;
  reducerProps.location = { search: " " };
  reducerProps.history = {
    push: jest.fn(),
    location: {},
  };
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("Search", () => {
  it("renders properly", () => {
    const component = shallow(<SearchResults {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
