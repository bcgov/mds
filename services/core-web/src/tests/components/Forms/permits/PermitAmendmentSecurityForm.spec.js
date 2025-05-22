import React from "react";
import { render } from "@testing-library/react";
import { PermitAmendmentSecurityForm } from "@/components/Forms/permits/PermitAmendmentSecurityForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.submitting = false;
  props.isEditMode = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("PermitAmendmentSecurityForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><PermitAmendmentSecurityForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
