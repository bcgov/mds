import React from "react";
import { shallow } from "enzyme";
import { PermitResultsTable } from "@/components/search/PermitResultsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.header = MOCK.SEARCH_OPTIONS[2].description;
  reducerProps.highlightRegex = RegExp(".*");
  reducerProps.searchResults = MOCK.PERMIT_SEARCH_RESULTS;
};

beforeEach(() => {
  setupReducerProps();
});

// TypeError: Cannot read properties of undefined (reading 'map')

//       55 |       key: "mine_guid",
//       56 |       render: (record) => {
//     > 57 |         return record.mine.map((mine) => (
//          |                            ^
//       58 |           <Link
describe("PermitResultsTable", () => {
  it("renders properly", () => {
    const component = shallow(<PermitResultsTable {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
