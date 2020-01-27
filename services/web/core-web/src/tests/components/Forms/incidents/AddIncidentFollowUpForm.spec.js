import React from "react";
import { shallow } from "enzyme";
import { AddIncidentFollowUpForm } from "@/components/Forms/incidents/AddIncidentFollowUpForm";
import { FOLLOWUP_ACTIONS } from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

const setupProps = () => {
  props.initialValues = {};
  props.uploadedFiles = [];
  props.followupActionOptions = FOLLOWUP_ACTIONS;
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
