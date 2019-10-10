import React from "react";
import { shallow } from "enzyme";
import { PermitAmendmentForm } from "@/components/Forms/PermitAmendmentForm";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.getDropdownPermitStatusOptions = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
  props.permitStatusOptions = [];
  props.mine_guid = "";
  props.isMajorMine = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("PermitAmendmentForm", () => {
  it("renders properly", () => {
    const component = shallow(<PermitAmendmentForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
