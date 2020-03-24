import React from "react";
import { shallow } from "enzyme";
import { MineSecurityInfo } from "@/components/mine/Securities/MineSecurityInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchPermits = jest.fn();
  dispatchProps.fetchMineBonds = jest.fn();
  dispatchProps.createBond = jest.fn();
  dispatchProps.updateBond = jest.fn();
};

const setupProps = () => {
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.permits = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_permit_numbers;
  props.bondTotals = {};
  props.bondStatusOptionsHash = {};
  props.bondTypeOptionsHash = {};
  props.bonds = MOCK.BONDS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineSecurityInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineSecurityInfo {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
