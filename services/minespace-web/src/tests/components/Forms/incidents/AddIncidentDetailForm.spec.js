import React from "react";
import { shallow } from "enzyme";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onFileLoad = jest.fn();
  dispatchProps.onRemoveFile = jest.fn();
};

const setupProps = () => {
  props.incidentDeterminationOptions = {};
  // eslint-disable-next-line prefer-destructuring
  props.mineGuid = MOCK.MINES.mineIds[0];
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
