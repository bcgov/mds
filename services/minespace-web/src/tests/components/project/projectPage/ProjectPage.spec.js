import React from "react";
import { shallow } from "enzyme";
import { ProjectPage } from "@/components/pages/Project/ProjectPage";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.mines = {};
  props.project = MOCK.PROJECT;
};

const setupDispatchProps = () => {
  dispatchProps.fetchProjectById = jest.fn(() => Promise.resolve());
  dispatchProps.fetchEMLIContactsByRegion = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ProjectPage", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectPage {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
