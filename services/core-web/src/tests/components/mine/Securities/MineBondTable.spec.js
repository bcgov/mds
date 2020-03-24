import React from "react";
import { shallow } from "enzyme";
import { MineBondTable } from "@/components/mine/Securities/MineBondTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openEditBondModal = jest.fn();
  dispatchProps.openViewBondModal = jest.fn();
  dispatchProps.openAddBondModal = jest.fn();
  dispatchProps.releaseOrConfiscateBond = jest.fn();
  dispatchProps.onExpand = jest.fn();
};

const setupProps = () => {
  props.permits = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_permit_numbers;
  props.bondStatusOptionsHash = {};
  props.bondTypeOptionsHash = {};
  props.isLoaded = true;
  props.expandedRowKeys = [];
  props.bonds = MOCK.BONDS.records;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineBondTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineBondTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
