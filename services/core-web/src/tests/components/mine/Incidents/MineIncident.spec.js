import React from "react";
import { shallow } from "enzyme";
import MineIncident from "@/components/mine/Incidents/MineIncident";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.incident = MOCK.INCIDENT;
  props.formErrors = {};
  props.formValues = {
    initial_incident_documents: [],
    final_report_documents: [],
    internal_ministry_documents: [],
  };
  props.formIsDirty = false;
  props.match = {
    mineGuid: "448014a5-981f-47b8-8687-4963666776b8",
    mineIncidentGuid: "668014a5-981f-47b8-8687-4963666776b9",
  };
  props.location = {
    state: {
      isEditMode: false,
      mineName: "Test Mine",
    },
  };
  props.history = {
    push: jest.fn(),
    replace: jest.fn(),
  };
  props.reset = jest.fn();
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
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineIncident", () => {
  it("renders properly", () => {
    const component = shallow(<MineIncident {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
