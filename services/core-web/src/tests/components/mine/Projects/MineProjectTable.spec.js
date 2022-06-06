import React from "react";
import { shallow } from "enzyme";
import { MineProjectTable } from "@/components/mine/Projects/MineProjectTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.projects = MOCK.PROJECTS.records;
  props.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
  props.isLoaded = true;
};

beforeEach(() => {
  setupProps();
});

describe("MineProjectTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineProjectTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
