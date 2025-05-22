import React from "react";
import { render } from "@testing-library/react";
import { InspectionsTable } from "@/components/dashboard/mine/inspections/InspectionsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.orders = MOCK.COMPLIANCE.orders;
  props.isLoaded = true;
};

beforeEach(() => {
  setupProps();
});

describe("InspectionsTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<InspectionsTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
