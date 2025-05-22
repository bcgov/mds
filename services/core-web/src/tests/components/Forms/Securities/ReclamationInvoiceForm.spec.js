import React from "react";
import { render } from "@testing-library/react";
import { ReclamationInvoiceForm } from "@/components/Forms/Securities/ReclamationInvoiceForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "Add Reclamation Invoice";
  props.mineGuid = "462562457";
  props.submitting = false;
  [props.invoice] = MOCK.RECLAMATION_INVOICES.records;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ReclamationInvoiceForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ReclamationInvoiceForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
