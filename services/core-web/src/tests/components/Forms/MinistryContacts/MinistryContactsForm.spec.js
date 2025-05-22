import React from "react";
import { render } from "@testing-library/react";
import { MinistryContactForm } from "@/components/Forms/MinistryContacts/MinistryContactForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><MinistryContactForm {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
