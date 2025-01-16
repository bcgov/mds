import React from "react";
import { shallow } from "enzyme";
import { EditWorkerInformationForm } from "@/components/Forms/mines/EditWorkerInformationForm";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleToggleEdit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditWorkerInformationForm", () => {
  it("renders properly", () => {
    const component = shallow(<EditWorkerInformationForm {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
