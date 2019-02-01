import React from "react";
import { shallow } from "enzyme";
import { AddTenureNumberForm } from "@/components/Forms/AddTenureNumberForm";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddTenureNumberForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddTenureNumberForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
