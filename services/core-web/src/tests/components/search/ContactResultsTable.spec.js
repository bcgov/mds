import React from "react";
import { render } from "@testing-library/react";
import { ContactResultsTable } from "@/components/search/ContactResultsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const reducerProps = {
  header: MOCK.SEARCH_OPTIONS[1].description,
  highlightRegex: RegExp(".*"),
  query: MOCK.SEARCH_RESULTS.search_terms.join("|"),
  searchResults: MOCK.PARTY_SEARCH_RESULTS,
  partyRelationshipTypeHash: MOCK.PARTY_RELATIONSHIP_TYPE_HASH,
};

describe("ContactResultsTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ContactResultsTable {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
