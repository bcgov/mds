import React from "react";
import { shallow } from "enzyme";
import { AddQuickPartyForm } from "@/components/Forms/parties/AddQuickPartyForm";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

const setupProps = () => {
  props.isPerson = true;
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddQuickPartyForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddQuickPartyForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
