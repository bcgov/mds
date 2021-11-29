import React from "react";
import { shallow } from "enzyme";
import { ProjectSummariesTable } from "@/components/dashboard/mine/projectSummaries/ProjectSummariesTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.projectSummaries = MOCK.PROJECT_SUMMARIES.records;
  props.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
};

const setupDispatchProps = () => {
  
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ProjectSummariesTable", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectSummariesTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
