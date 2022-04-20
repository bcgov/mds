import React from "react";
import { shallow } from "enzyme";
import { ProjectSummaries } from "@/components/dashboard/mine/projectSummaries/ProjectSummaries";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.projectSummaries = MOCK.PROJECT_SUMMARIES.records;
  props.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.fetchProjectSummariesByProject = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ProjectSummaries", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectSummaries {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
