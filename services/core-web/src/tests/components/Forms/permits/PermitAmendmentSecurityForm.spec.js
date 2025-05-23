import React from "react";
import { render } from "@testing-library/react";
import { PermitAmendmentSecurityForm } from "@/components/Forms/permits/PermitAmendmentSecurityForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
};
const props = {
  submitting: false,
  isEditMode: true,
};

describe("PermitAmendmentSecurityForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <PermitAmendmentSecurityForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
