import React from "react";
import { shallow } from "enzyme";
import { PermitResultsTable } from "@/components/search/PermitResultsTable";
import CoreTable from "@mds/common/components/common/CoreTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const multiMinePermitMock = {
  permit_guid: "...",
  permit_no: "CX-123",
  mine: [
    { mine_guid: "abc", mine_name: "Mine One", mine_no: "M-001" },
    { mine_guid: "def", mine_name: "Mine Two", mine_no: "M-002" },
  ]
}

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

  it("renders comma-separated mine links for multi-mine permits", () => {
    const component = shallow(<PermitResultsTable
      header="Permits"
      highlightRegex={RegExp(".*")}
      searchResults={[multiMinePermitMock]}
    />);
    const columns = component.find(CoreTable).prop('columns');
    const mineColumn = columns[2]; // the Mine(s) column from the PermitResultsTable
    const rendered = shallow(<div>{mineColumn.render(multiMinePermitMock)}</div>); // Render the mine column with 2 associated mines
    expect(rendered.find('Link').length).toBe(2); // There should be 2 links (1 for each associated mine) in the rendered mine column
  });

});
