import React from "react";
import { shallow } from "enzyme";
import { AddVarianceForm } from "@/components/Forms/variances/AddVarianceForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.mineGuid = "48593";
  props.submitting = false;
  props.complianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddVarianceForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddVarianceForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
