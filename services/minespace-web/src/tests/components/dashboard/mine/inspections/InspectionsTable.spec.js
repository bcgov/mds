import React from "react";
import { shallow } from "enzyme";
import { InspectionsTable } from "@/components/dashboard/mine/inspections/InspectionsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

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
    const component = shallow(<InspectionsTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
