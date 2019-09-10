import React from "react";
import { shallow } from "enzyme";
import { AddReportForm } from "@/components/Forms/reports/AddReportForm";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.getDropdownPermitStatusOptions = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
  props.permitStatusOptions = [];
  props.mine_guid = "";
  props.initialValues = { mine_report_definition_guid: "" };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddReportForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddReportForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
