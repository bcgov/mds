import React from "react";
import { shallow } from "enzyme";
import { MineAdministrativeAmendmentTable } from "@/components/mine/AdministrativeAmendment/MineAdministrativeAmendmentTable";
const props = {};

const setupProps = () => {
  props.handleSearch = jest.fn();
  props.administrativeAmendmentApplications = [];
  props.sortField = undefined;
  props.sortDir = undefined;
  props.isLoaded = true;
  props.location = {
    pathname: "mock pathname",
    search: "mock search",
  };
  props.onExpand = jest.fn();
  props.expandedRowKeys = [];
};

beforeEach(() => {
  setupProps();
});

describe("MineAdministrativeAmendmentTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineAdministrativeAmendmentTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
