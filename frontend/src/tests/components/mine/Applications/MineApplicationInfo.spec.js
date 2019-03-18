import React from "react";
import { shallow } from "enzyme";
import * as MOCK from "@/tests/mocks/dataMocks";
import { MineApplicationInfo } from "@/components/mine/Applications/MineApplicationInfo";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchApplications = jest.fn();
  dispatchProps.updateApplication = jest.fn();
  dispatchProps.createApplication = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
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
