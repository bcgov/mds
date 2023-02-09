import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import { IncidentForm } from "@/components/Forms/incidents/IncidentForm";
import * as MOCK from "@/tests/mocks/dataMocks";
import { store } from "@/App";

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
  props.documents = [
    {
      mine_incident_document_type_code: "INI",
    },
  ];
  props.incidentFollowUpActionOptions = [
    {
      mine_incident_followup_investigation_type: "TEST",
    },
  ];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("IncidentForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <IncidentForm {...dispatchProps} {...props} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
