import React from "react";
import { shallow } from "enzyme";
import { AddIncidentModal } from "@/components/modalContent/AddIncidentModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.reset = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.incidentDeterminationOptions = {};
  props.incidentStatusCodeOptions = {};
  props.doSubparagraphOptions = {};
  props.followupActionOptions = {};
  props.initialValues = {};
  props.inspectors = {};
  props.addReportingFormValues = {};
  props.addDetailFormValues = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddIncidentModal", () => {
  it("renders properly", () => {
    const component = shallow(<AddIncidentModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
