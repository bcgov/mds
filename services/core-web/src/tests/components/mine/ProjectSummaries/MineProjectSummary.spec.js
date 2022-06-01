import React from "react";
import { shallow } from "enzyme";
import { MineProject } from "@/components/mine/Projects/MineProject";
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

describe("MineProject", () => {
  it("renders properly", () => {
    const component = shallow(<MineProject {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
