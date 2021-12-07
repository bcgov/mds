import React from "react";
import { shallow } from "enzyme";
import { MineProjectSummaryTable } from "@/components/mine/ProjectSummaries/MineProjectSummaryTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.projectSummaries = MOCK.PROJECT_SUMMARIES.records;
  props.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
  props.isLoaded = true;
};

beforeEach(() => {
  setupProps();
});

describe("MineProjectSummaryTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineProjectSummaryTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
