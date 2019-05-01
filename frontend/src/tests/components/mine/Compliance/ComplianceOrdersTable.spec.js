import React from "react";
import { shallow } from "enzyme";
import ComplianceOrdersTable from "@/components/mine/Compliance/ComplianceOrdersTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.handlePageChange = () => {};
  props.minOrderList = 0;
  props.maxOrderList = 10;
  props.filteredOrders = MOCK.OPEN_ORDERS;
};

beforeEach(() => {
  setupProps();
});

describe("ComplianceOrdersTable", () => {
  it("renders properly", () => {
    const component = shallow(<ComplianceOrdersTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
