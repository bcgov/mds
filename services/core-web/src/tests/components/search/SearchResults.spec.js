import React from "react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import SearchResults from "@/components/search/SearchResults";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {
  fetchSearchOptions: jest.fn(),
  fetchPartyRelationshipTypes: jest.fn(),
  fetchSearchResults: jest.fn(),
};
const reducerProps = {
  searchOptions: MOCK.SEARCH_OPTIONS,
  searchResults: MOCK.SEARCH_RESULTS,
  searchTerms: ["Abb"],
  partyRelationshipTypeHash: MOCK.MINE_INFO_HASH,
  location: { search: "q=test" },
  history: {
    push: jest.fn(),
  },
  searchResults: MOCK.SEARCH_RESULTS,
  hideLoadingIndicator: true,
};

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
