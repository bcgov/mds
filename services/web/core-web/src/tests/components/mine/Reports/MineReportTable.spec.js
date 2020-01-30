import React from "react";
import { shallow } from "enzyme";
import { MineReportTable } from "@/components/mine/Reports/MineReportTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.mineReports = [];
};

beforeEach(() => {
  setupProps();
});

describe("MineReportTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineReportTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
