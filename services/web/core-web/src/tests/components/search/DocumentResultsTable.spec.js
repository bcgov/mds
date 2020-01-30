import React from "react";
import { shallow } from "enzyme";
import { DocumentResultsTable } from "@/components/search/DocumentResultsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.header = MOCK.SEARCH_OPTIONS[3].description;
  reducerProps.highlightRegex = RegExp(".*");
  reducerProps.searchResults = MOCK.MINE_DOCUMENT_SEARCH_RESULTS;
};

beforeEach(() => {
  setupReducerProps();
});

describe("DocumentResultsTable", () => {
  it("renders properly", () => {
    const component = shallow(<DocumentResultsTable {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
