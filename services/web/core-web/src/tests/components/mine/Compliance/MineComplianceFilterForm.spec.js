import React from "react";
import { shallow } from "enzyme";
import { MineComplianceFilterForm } from "@/components/mine/Compliance/MineComplianceFilterForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.reset = jest.fn();
};

const setupProps = () => {
  props.complianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineComplianceFilterForm", () => {
  it("renders properly", () => {
    const component = shallow(<MineComplianceFilterForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
