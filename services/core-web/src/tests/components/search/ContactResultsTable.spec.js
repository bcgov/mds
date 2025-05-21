import React from "react";
import { render } from "@testing-library/react";
import { ContactResultsTable } from "@/components/search/ContactResultsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.header = MOCK.SEARCH_OPTIONS[1].description;
  reducerProps.highlightRegex = RegExp(".*");
  reducerProps.query = MOCK.SEARCH_RESULTS.search_terms.join("|");
  reducerProps.searchResults = MOCK.PARTY_SEARCH_RESULTS;
  reducerProps.partyRelationshipTypeHash = MOCK.PARTY_RELATIONSHIP_TYPE_HASH;
};

beforeEach(() => {
  setupReducerProps();
});

describe("ContactResultsTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ContactResultsTable {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
