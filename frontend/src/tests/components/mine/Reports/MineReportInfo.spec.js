import React from "react";
import { shallow } from "enzyme";
import { MineReportInfo } from "@/components/mine/Reports/MineReportInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineReports = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineReportInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineReportInfo {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
