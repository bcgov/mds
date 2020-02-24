import React from "react";
import { shallow } from "enzyme";
import { MineDashboard } from "@/components/dashboard/mine/MineDashboard";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.history = { push: jest.fn() };
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPartyRelationships = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineDashboard", () => {
  it("renders properly", () => {
    const wrapper = shallow(<MineDashboard {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
