import React from "react";
import { shallow } from "enzyme";
import { MineReportInfo } from "@/components/mine/Reports/MineReportInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupProps = () => {
  props.mines = MOCK.MINES.mines;
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.location = { search: "" };
  props.history = {
    replace: jest.fn(),
  };
  props.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineReports = jest.fn(() => Promise.resolve());
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
