import React from "react";
import { shallow } from "enzyme";
import { PermitResultsTable } from "@/components/search/PermitResultsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const reducerProps = {
  header: MOCK.SEARCH_OPTIONS[2].description,
  highlightRegex: RegExp(".*"),
  searchResults: MOCK.PERMIT_SEARCH_RESULTS,
};

describe("PermitResultsTable", () => {
  it("renders properly", () => {
    const component = shallow(<PermitResultsTable {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
