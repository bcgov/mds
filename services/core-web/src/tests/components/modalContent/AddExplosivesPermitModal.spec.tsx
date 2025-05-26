import React from "react";
import { render } from "@testing-library/react";
import { AddExplosivesPermitModal } from "@/components/modalContent/AddExplosivesPermitModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  isApproved: false,
  isPermitTab: false,
  title: "Permit",
  mineGuid: "523642546",
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  inspectors: [],
  initialValues: {},
  documentTypeDropdownOptions: [],
  documents: [],
  isProcessed: false,
  isAmendment: false,
};

describe("AddExplosivesPermitModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddExplosivesPermitModal {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
