import React from "react";
import { shallow } from "enzyme";
import { Reports } from "@/components/dashboard/mine/reports/Reports";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineReports = jest.fn();
  dispatchProps.updateMineReport = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("Reports", () => {
  it("renders properly", () => {
    const component = shallow(<Reports {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
