import React from "react";
import * as MOCK from "@/tests/mocks/dataMocks";
import SearchResults from "@/components/search/SearchResults";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

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
    const component = render(
      <ReduxWrapper>
        <SearchResults {...dispatchProps} {...reducerProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
