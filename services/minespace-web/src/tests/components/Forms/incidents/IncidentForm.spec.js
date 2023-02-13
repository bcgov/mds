import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import { IncidentForm } from "@/components/Forms/incidents/IncidentForm";
import * as MOCK from "@/tests/mocks/dataMocks";
import { store } from "@/App";

const dispatchProps = {};
const props = {};

const setupProps = () => {
  props.incident = MOCK.INCIDENT;
  props.incidentCategoryCodeOptions = MOCK.INCIDENT_CATEGORY_CODE_OPTIONS;
  props.formValues = { ...MOCK.INCIDENT };
  props.handlers = { deleteDocument: jest.fn(() => Promise.resolve()) };
  props.match = { params: { mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.inspectorOptions = [];
};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
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
