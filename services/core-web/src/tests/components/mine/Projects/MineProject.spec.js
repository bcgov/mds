import React from "react";
import { render } from "@testing-library/react";
import { MineProject } from "@/components/mine/Projects/MineProject";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mines = MOCK.MINES.mines;
  props.mineGuid = "18145c75-49ad-0101-85f3-a43e45ae989a";
  props.projects = MOCK.PROJECTS.records;
  props.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
};

const setupDispatchProps = () => {
  dispatchProps.fetchProjectsByMine = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineProject", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper><MineProject {...dispatchProps} {...props} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
