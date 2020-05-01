import React from "react";
import { shallow } from "enzyme";
import { AddReclamationInvoiceModal } from "@/components/modalContent/AddReclamationInvoiceModal";
import * as MOCK from "@/tests/mocks/dataMocks";

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
    const component = shallow(<AddReclamationInvoiceModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
