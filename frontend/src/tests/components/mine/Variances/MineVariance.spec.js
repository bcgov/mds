import React from "react";
import { shallow } from "enzyme";
import { MineVariance } from "@/components/mine/Variances/MineVariance";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.createVariance = jest.fn();
  dispatchProps.fetchVariancesByMine = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.variances = MOCK.VARIANCES.records;
  reducerProps.complianceCodesHash = MOCK.HSRCM_HASH;
  reducerProps.complianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MineVariance", () => {
  it("renders properly", () => {
    const component = shallow(<MineVariance {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
