import React from "react";
import { render } from "@testing-library/react";
import { PermitAmendmentForm } from "@/components/Forms/PermitAmendmentForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  getDropdownPermitStatusOptions: jest.fn(),
};
const props = {
  title: "mockTitle",
  submitting: false,
  permitStatusOptions: [],
  mine_guid: "",
  isMajorMine: true,
};

describe("PermitAmendmentForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <PermitAmendmentForm
          {...dispatchProps}
          {...props}
          handleRemovePermitAmendmentDocument={jest.fn()}
        />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
