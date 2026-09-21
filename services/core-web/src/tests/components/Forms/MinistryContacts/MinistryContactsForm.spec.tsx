import React from "react";
import { render } from "@testing-library/react";
import { MinistryContactForm } from "@/components/Forms/MinistryContacts/MinistryContactForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  submitting: false,
  title: "Update MCM Contact",
  handleSubmit: jest.fn(),
  closeModal: jest.fn(),
  regionDropdownOptions: [],
  MinistryContactTypes: [],
  isEdit: true,
  initialValues: {},
  formValues: {},
  contacts: [],
  onSubmit: jest.fn(),
  distributionListOptions: [],
};

describe("MinistryContactForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <MinistryContactForm {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
