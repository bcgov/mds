import React from "react";
import { shallow } from "enzyme";
import { MineComplianceInfo } from "@/components/mine/Compliance/MineComplianceInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.MineComplianceInfo = MOCK.COMPLIANCE;
  props.filteredOrders = MOCK.COMPLIANCE.open_orders;
  props.complianceFilterParams = {
    order_no: "",
    report_no: "",
    due_date: "",
    inspector: "",
    violation: [],
    overdue: null,
  };
  props.isLoading = false;
};

const setupDispatchProps = () => {
  dispatchProps.handleComplianceFilter = jest.fn();
  dispatchProps.fetchMineComplianceInfo = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineComplianceInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineComplianceInfo {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
