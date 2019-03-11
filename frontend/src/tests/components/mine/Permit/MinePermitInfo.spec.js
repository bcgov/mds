import React from "react";
import { shallow } from "enzyme";
import { MinePermitInfo } from "@/components/mine/Permit/MinePermitInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchPermits = jest.fn();
  dispatchProps.fetchPermitStatusOptions = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
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
