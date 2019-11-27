import React from "react";
import { shallow } from "enzyme";
import { MinePermitInfo } from "@/components/mine/Permit/MinePermitInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchPermits = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPermitStatusOptions = jest.fn();
};

const setupProps = () => {
  props.mineGuid = "18145c75-49ad-0101-85f3-a43e45ae989a";
  props.match = { params: { id: "18145c75-49ad-0101-85f3-a43e45ae989a" } };
  props.mines = MOCK.MINES.mines;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MinePermitInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MinePermitInfo {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
