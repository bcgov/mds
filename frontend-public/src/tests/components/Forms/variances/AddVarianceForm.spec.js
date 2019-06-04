import React from "react";
import { shallow } from "enzyme";
import { AddVarianceForm } from "@/components/Forms/variances/AddVarianceForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.submitting = false;
  props.mineGuid = "1738472";
  props.complianceCodes = MOCK.COMPLIANCE_CODES.records;
};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("AddVarianceForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddVarianceForm {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
