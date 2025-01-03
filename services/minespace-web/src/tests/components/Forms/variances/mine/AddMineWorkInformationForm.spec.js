import React from "react";
import { shallow } from "enzyme";
import { AddMineWorkInformationForm } from "@/components/Forms/AddMineWorkInformationForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.submitting = false;
  props.mineWorkInformationGuid = "1738472";
  props.complianceCodes = MOCK.COMPLIANCE_CODES.records;
  props.title = "testing title";
  props.isEditMode = true;
  props.formValues = {};
};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.cancelEdit = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("AddMineWorkInformationForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddMineWorkInformationForm {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
