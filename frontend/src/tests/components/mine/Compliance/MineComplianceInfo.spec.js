import React from "react";
import { shallow } from "enzyme";
import { MineComplianceInfo } from "@/components/mine/Compliance/MineComplianceInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.MineComplianceInfo = MOCK.COMPLIANCE;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineComplianceInfo = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineComplianceInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineComplianceInfo {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
