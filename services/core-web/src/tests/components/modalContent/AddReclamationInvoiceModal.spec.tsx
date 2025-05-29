import React from "react";
import { render } from "@testing-library/react";
import { AddReclamationInvoiceModal } from "@/components/modalContent/AddReclamationInvoiceModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  oSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "Add Bond",
  permitGuid: "462562457",
  mineGuid: "1436613",
  invoice: MOCK.RECLAMATION_INVOICES.records[0],
  formValues: MOCK.RECLAMATION_INVOICES.records[0],
  edit: false,
};

describe("AddReclamationInvoiceModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddReclamationInvoiceModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
