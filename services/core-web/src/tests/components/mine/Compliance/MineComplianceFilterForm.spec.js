import React from "react";
import { render } from "@testing-library/react";
import { MineComplianceFilterForm } from "@/components/mine/Compliance/MineComplianceFilterForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
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
    const { container: component } = render(<ReduxWrapper><MineComplianceFilterForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
