import React from "react";
import { shallow } from "enzyme";
import { AddTailingsForm } from "@/components/Forms/AddTailingsForm";

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

describe("AddTailingsForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddTailingsForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
