import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import StepForms from "@/components/pages/Incidents/IncidentStepForms";
import * as MOCK from "@/tests/mocks/dataMocks";
import { store } from "@/App";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.formIsDirty = false;
  props.match = {
    params: {
      mineGuid: "5c654fe9-bce5-4ee4-891c-806c46266d54",
      mineIncidentGuid: "4d654fe9-bce5-4ee4-891c-806c46266d55",
    },
  };
  props.incident = MOCK.INCIDENT;
  props.isEditMode = false;
  props.confirmedSubmission = false;
  props.navigation = { next: jest.fn(), previous: jest.fn() };
  props.handlers = { save: jest.fn(), deleteDocument: jest.fn(), openModal: jest.fn() };
  props.formatInitialValues = jest.fn();
  props.setConfirmedSubmission = jest.fn();
  props.disabledButton = false;
  props.isFinalReviewStage = false;
};

const setupDispatchProps = () => {
  dispatchProps.clearMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.createMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.updateMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.removeDocumentFromMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.submit = jest.fn(() => Promise.resolve());
  dispatchProps.reset = jest.fn(() => Promise.resolve());
  dispatchProps.touch = jest.fn(() => Promise.resolve());
  dispatchProps.change = jest.fn(() => Promise.resolve());
  dispatchProps.destroy = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("IncidentStepForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <StepForms {...props} {...dispatchProps} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
