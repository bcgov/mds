import React from "react";
import { shallow } from "enzyme";
import { AddIncidentReportingForm } from "@/components/Forms/incidents/AddIncidentReportingForm";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

const setupProps = () => {
  props.initialValues = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddIncidentReportingForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddIncidentReportingForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
