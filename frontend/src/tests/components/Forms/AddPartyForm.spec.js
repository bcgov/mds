import React from "react";
import { shallow } from "enzyme";
import { AddPartyForm } from "@/components/Forms/AddPartyForm";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

const setupProps = () => {
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddPartyFrom", () => {
  it("renders properly", () => {
    const component = shallow(<AddPartyForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
