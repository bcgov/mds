import React from "react";
import { shallow } from "enzyme";
import { Reports } from "@/components/dashboard/mine/reports/Reports";
import * as MOCK from "@/tests/mocks/dataMocks";

const props: any = {};
const dispatchProps: any = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineReports = jest.fn(() => Promise.resolve());
  dispatchProps.updateMineReport = jest.fn();
  dispatchProps.fetchMineReportDefinitionOptions = jest.fn();
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
