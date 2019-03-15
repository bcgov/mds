import React from "react";
import { shallow } from "enzyme";
import { AddPermitForm } from "@/components/Forms/AddPermitForm";

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
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddPermitForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddPermitForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
