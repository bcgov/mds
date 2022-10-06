import React from "react";
import { shallow } from "enzyme";
import IncidentForm from "@/components/Forms/incidents/IncidentForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.incident = MOCK.INCIDENT;
  props.formValues = {
    initial_incident_documents: [],
    final_report_documents: [],
    internal_ministry_documents: [],
  };
  props.handlers = {
    deleteDocument: jest.fn(() => Promise.resolve()),
  };
  props.incidentCategoryCodeOptions = [];
  props.handleSubmit = jest.fn();
  props.isEditMode = false;
  props.match = {
    mineGuid: "448014a5-981f-47b8-8687-4963666776b8",
    mineIncidentGuid: "668014a5-981f-47b8-8687-4963666776b9",
  };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("IncidentForm", () => {
  it("renders properly", () => {
    const component = shallow(<IncidentForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
