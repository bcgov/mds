import React from "react";
import { shallow } from "enzyme";
import { MineProjectSummary } from "@/components/mine/ProjectSummaries/MineProjectSummary";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mineGuid = "18145c75-49ad-0101-85f3-a43e45ae989a";
  props.mines = MOCK.MINES.mines;
  props.projectSummaries = [];
  props.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
  props.userRoles = [];
};

const setupDispatchProps = () => {
  dispatchProps.fetchProjectSummariesByMine = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineProjectSummary", () => {
  it("renders properly", () => {
    const component = shallow(<MineProjectSummary {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
