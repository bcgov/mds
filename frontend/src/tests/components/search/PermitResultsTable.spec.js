import React from "react";
import { shallow } from "enzyme";
import { PermitResultsTable } from "@/components/search/PermitResultsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.header = MOCK.SEARCH_OPTIONS[2].description;
  reducerProps.highlightRegex = RegExp(".*");
  reducerProps.searchResults = MOCK.PERMIT_SEARCH_RESULTS;
};

beforeEach(() => {
  setupReducerProps();
});

describe("PermitResultsTable", () => {
  it("renders properly", () => {
    const component = shallow(<PermitResultsTable {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
