import React from "react";
import { render } from "@testing-library/react";
import { DocumentResultsTable } from "@/components/search/DocumentResultsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><DocumentResultsTable {...reducerProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
