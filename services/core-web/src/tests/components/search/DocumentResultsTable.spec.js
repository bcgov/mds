import React from "react";
import { render } from "@testing-library/react";
import { DocumentResultsTable } from "@/components/search/DocumentResultsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const reducerProps = {
  header: MOCK.SEARCH_OPTIONS[3].description,
  highlightRegex: RegExp(".*"),
  searchResults: MOCK.MINE_DOCUMENT_SEARCH_RESULTS,
};

describe("DocumentResultsTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><DocumentResultsTable {...reducerProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
