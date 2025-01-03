import React from "react";
import { shallow } from "enzyme";
import { PermitAmendmentSecurityForm } from "@/components/Forms/permits/PermitAmendmentSecurityForm";

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
    const component = shallow(<PermitAmendmentSecurityForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
