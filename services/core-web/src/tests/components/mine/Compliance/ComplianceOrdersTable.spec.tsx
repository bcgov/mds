import React from "react";
import { render } from "@testing-library/react";
import ComplianceOrdersTable from "@/components/mine/Compliance/ComplianceOrdersTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {
  handlePageChange: () => { },
  minOrderList: 0,
  maxOrderList: 10,
  filteredOrders: MOCK.OPEN_ORDERS,
};

describe("ComplianceOrdersTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<ComplianceOrdersTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
