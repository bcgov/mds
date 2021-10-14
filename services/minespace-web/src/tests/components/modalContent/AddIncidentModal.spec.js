import React from "react";
import { shallow } from "enzyme";
import { AddIncidentModal } from "@/components/modalContent/incidents/AddIncidentModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.incidentDeterminationOptions = {};
  props.incidentCategoryCodeOptions = {};
  props.addIncidentFormValues = {};
  // eslint-disable-next-line prefer-destructuring
  props.mineGuid = MOCK.MINES.mineIds[0];
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
