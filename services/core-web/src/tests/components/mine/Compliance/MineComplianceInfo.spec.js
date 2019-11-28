import React from "react";
import { shallow } from "enzyme";
import { MineComplianceInfo } from "@/components/mine/Compliance/MineComplianceInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mines = MOCK.MINES.mines;
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.MineComplianceInfo = MOCK.COMPLIANCE;
};

const setupDispatchProps = () => {
  dispatchProps.handleComplianceFilter = jest.fn();
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
