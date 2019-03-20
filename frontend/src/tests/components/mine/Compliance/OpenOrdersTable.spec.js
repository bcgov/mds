import React from "react";
import { shallow } from "enzyme";
import OpenOrdersTable from "@/components/mine/Compliance/OpenOrdersTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.handlePageChange = () => {};
  props.minOrderList = 0;
  props.maxOrderList = 10;
  props.openOrders = MOCK.OPEN_ORDERS;
};

beforeEach(() => {
  setupProps();
});

describe("OpenOrdersTable", () => {
  it("renders properly", () => {
    const component = shallow(<OpenOrdersTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
