import React from "react";
import { render } from "@testing-library/react";
import { AddTailingsForm } from "@/components/Forms/AddTailingsForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "mockTitle",
  submitting: false,
  consequenceClassificationStatusCodeOptions: [],
  itrbExemptionStatusCodeOptions: [],
  TSFOperatingStatusCodeOptions: [],
};

describe("AddTailingsForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddTailingsForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
