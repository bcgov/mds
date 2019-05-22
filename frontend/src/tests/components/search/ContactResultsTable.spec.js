import React from "react";
import { shallow } from "enzyme";
import { ContactResultsTable } from "@/components/search/ContactResultsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.header = MOCK.SEARCH_OPTIONS[1].description;
  reducerProps.highlightRegex = RegExp(".*");
  reducerProps.query = MOCK.SEARCH_RESULTS.search_terms.join("|");
  reducerProps.searchResults = MOCK.PARTY_SEARCH_RESULTS;
};

beforeEach(() => {
  setupReducerProps();
});

describe("MineResultsTable", () => {
  it("renders properly", () => {
    const component = shallow(<ContactResultsTable {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
