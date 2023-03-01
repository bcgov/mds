import React from "react";
import { shallow } from "enzyme";
import { MineIncident } from "@/components/mine/Incidents/MineIncident";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

function mockFunction() {
  const original = require.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mineGuid: "448014a5-981f-47b8-8687-4963666776b8",
      mineIncidentGuid: "668014a5-981f-47b8-8687-4963666776b9",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

const setupProps = () => {
  props.incident = MOCK.INCIDENT;
  props.formErrors = {};
  props.formValues = {
    initial_incident_documents: [],
    final_report_documents: [],
    internal_ministry_documents: [],
  };
  props.formIsDirty = false;
  props.location = {
    pathname:
      "/mines/448014a5-981f-47b8-8687-4963666776b8/incidents/668014a5-981f-47b8-8687-4963666776b9",
  };
  props.history = {
    push: jest.fn(),
    replace: jest.fn(),
  };
};

const setupDispatchProps = () => {
  dispatchProps.clearMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.createMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.updateMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.removeDocumentFromMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.submit = jest.fn(() => Promise.resolve());
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
