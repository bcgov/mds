import React from "react";
import { render } from "@testing-library/react";
import ComplianceOrdersTable from "@/components/mine/Compliance/ComplianceOrdersTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.handlePageChange = () => { };
  props.minOrderList = 0;
  props.maxOrderList = 10;
  props.filteredOrders = MOCK.OPEN_ORDERS;
};

beforeEach(() => {
  setupProps();
});

describe("ComplianceOrdersTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<ComplianceOrdersTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
