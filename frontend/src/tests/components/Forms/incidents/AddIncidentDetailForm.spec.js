import React from "react";
import { shallow } from "enzyme";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";

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

describe("AddIncidentDetailForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddIncidentDetailForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
