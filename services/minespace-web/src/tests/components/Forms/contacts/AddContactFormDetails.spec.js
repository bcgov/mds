import React from "react";
import { shallow } from "enzyme";
import { AddContactFormDetails } from "@/components/Forms/contacts/AddContactFormDetails";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.createParty = jest.fn();
  dispatchProps.updateParty = jest.fn();
  dispatchProps.fetchParties = jest.fn();
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.handleSelectChange = jest.fn();
  dispatchProps.onCancel = jest.fn();
};

const setupProps = () => {
  props.formValues = {};
  props.isDirty = false;
  props.organizations = [];
  props.contacts = [];
  props.initialValues = {};
  props.partyRelationshipTypesList = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddContactFormDetails", () => {
  it("renders properly", () => {
    const component = shallow(<AddContactFormDetails {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
