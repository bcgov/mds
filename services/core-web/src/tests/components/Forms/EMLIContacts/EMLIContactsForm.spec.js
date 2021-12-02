import React from "react";
import { shallow } from "enzyme";
import { EMLIContactForm } from "@/components/Forms/EMLIContacts/EMLIContactForm";

const props = {};

const setupProps = () => {
  props.submitting = false;
  props.title = "Update EMLI Contact";
  props.handleSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.regionDropdownOptions = [];
  props.EMLIContactTypes = [];
  props.isEdit = true;
  props.initialValues = {};
  props.formValues = {};
  props.contacts = [];
};

beforeEach(() => {
  setupProps();
});

describe("EMLIContactForm", () => {
  it("renders properly", () => {
    const component = shallow(<EMLIContactForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
