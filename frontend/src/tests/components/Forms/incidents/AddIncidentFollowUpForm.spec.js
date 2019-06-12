import React from "react";
import { shallow } from "enzyme";
import { AddIncidentFollowUpForm } from "@/components/Forms/incidents/AddIncidentFollowUpForm";

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

describe("AddIncidentFollowUpForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddIncidentFollowUpForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
