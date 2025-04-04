import React from "react";
import { shallow } from "enzyme";
import { MinistryContactForm } from "@/components/Forms/MinistryContacts/MinistryContactForm";

const props = {};

const setupProps = () => {
  props.submitting = false;
  props.title = "Update MCM Contact";
  props.handleSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.regionDropdownOptions = [];
  props.MinistryContactTypes = [];
  props.isEdit = true;
  props.initialValues = {};
  props.formValues = {};
  props.contacts = [];
};

beforeEach(() => {
  setupProps();
});

describe("MinistryContactForm", () => {
  it("renders properly", () => {
    const component = shallow(<MinistryContactForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
