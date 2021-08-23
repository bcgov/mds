import React from "react";
import { shallow } from "enzyme";
import { MineWorkInformation } from "@/components/dashboard/mine/overview/MineWorkInformation";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mine_guid = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_guid;
  props.mineWorkInformations = MOCK.MINE_WORK_INFORMATIONS;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineWorkInformations = jest.fn(() => Promise.resolve());
  dispatchProps.createMineWorkInformation = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineWorkInformations = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineWorkInformation", () => {
  it("renders properly", () => {
    const wrapper = shallow(<MineWorkInformation {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
