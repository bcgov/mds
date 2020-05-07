import React from "react";
import { shallow } from "enzyme";
import { ReclamationInvoiceForm } from "@/components/Forms/Securities/ReclamationInvoiceForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
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
    const component = shallow(<ReclamationInvoiceForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
