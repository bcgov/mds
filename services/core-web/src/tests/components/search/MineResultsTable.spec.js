import React from "react";
import { render } from "@testing-library/react";
import { MineResultsTable } from "@/components/search/MineResultsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.header = MOCK.SEARCH_OPTIONS[0].description;
  reducerProps.highlightRegex = RegExp(".*");
  reducerProps.query = MOCK.SEARCH_RESULTS.search_terms.join("|");
  reducerProps.searchResults = MOCK.MINE_SEARCH_RESULTS;
};

beforeEach(() => {
  setupReducerProps();
});

describe("MineResultsTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><MineResultsTable {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
