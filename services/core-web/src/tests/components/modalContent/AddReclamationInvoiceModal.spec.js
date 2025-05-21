import React from "react";
import { render } from "@testing-library/react";
import { AddReclamationInvoiceModal } from "@/components/modalContent/AddReclamationInvoiceModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.oSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "Add Bond";
  props.permitGuid = "462562457";
  props.mineGuid = "1436613";
  [props.invoice] = MOCK.RECLAMATION_INVOICES.records;
  [props.formValues] = MOCK.RECLAMATION_INVOICES.records;
  props.edit = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddReclamationInvoiceModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddReclamationInvoiceModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
