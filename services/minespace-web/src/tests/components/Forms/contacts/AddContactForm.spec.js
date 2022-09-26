import React from "react";
import { shallow } from "enzyme";
import { AddContactForm } from "@/components/Forms/contacts/AddContactForm";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.onCancel = jest.fn();
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.contacts = [];
  props.parties = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddContactForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddContactForm {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
