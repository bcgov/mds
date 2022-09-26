import React from "react";
import { shallow } from "enzyme";
import MajorProjectTable from "@/components/dashboard/majorProjectHomePage/MajorProjectTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.handleSearch = jest.fn();
  props.projects = MOCK.MAJOR_PROJECTS_DASHBOARD.records;
  props.sortField = "project_id";
  props.sortDir = "asc";
  props.searchParams = { search: "substring" };
};

beforeEach(() => {
  setupProps();
});

describe("MajorProjectTable", () => {
  it("renders properly", () => {
    const component = shallow(<MajorProjectTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
