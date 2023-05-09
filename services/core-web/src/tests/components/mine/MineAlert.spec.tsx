import React from "react";
import { shallow } from "enzyme";
import { MineAlert } from "@/components/mine/MineAlert";
import * as MOCK from "@/tests/mocks/dataMocks";

const props: any = {};
const dispatchProps: any = {};

const setupDispatchProps = () => {
  dispatchProps.createMineAlert = jest.fn();
  dispatchProps.updateMineAlert = jest.fn();
  dispatchProps.fetchMineAlertsByMine = jest.fn(() => Promise.resolve());
  dispatchProps.deleteMineAlert = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.mineAlerts = MOCK.MINE_ALERTS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineAlert", () => {
  it("renders dispatchProperly", () => {
    const component = shallow(<MineAlert {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
