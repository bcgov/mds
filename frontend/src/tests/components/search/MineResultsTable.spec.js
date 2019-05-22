import React from "react";
import { shallow } from "enzyme";
import { MineResultsTable } from "@/components/search/MineResultsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

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
    const component = shallow(<MineResultsTable {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
