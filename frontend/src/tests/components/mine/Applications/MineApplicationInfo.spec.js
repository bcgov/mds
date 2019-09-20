import React from "react";
import { shallow } from "enzyme";
import * as MOCK from "@/tests/mocks/dataMocks";
import { MineApplicationInfo } from "@/components/mine/Applications/MineApplicationInfo";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchApplications = jest.fn(() => Promise.resolve());
  dispatchProps.updateApplication = jest.fn();
  dispatchProps.createApplication = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.mineGuid = "18145c75-49ad-0101-85f3-a43e45ae989a";
  props.mines = MOCK.MINES.mines;
  props.applications = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineApplicationInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineApplicationInfo {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
