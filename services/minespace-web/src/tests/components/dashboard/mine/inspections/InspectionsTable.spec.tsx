import React from "react";
import { render } from "@testing-library/react";
import { InspectionsTable } from "@/components/dashboard/mine/inspections/InspectionsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {
  orders: MOCK.COMPLIANCE.orders,
  isLoaded: true,
};
const dispatchProps = {};

describe("InspectionsTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<InspectionsTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
