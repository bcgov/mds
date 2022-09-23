import React from "react";
import { shallow } from "enzyme";
import IncidentForm from "@/components/Forms/incidents/IncidentForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupProps = () => {
  props.incident = MOCK.INCIDENT;
  props.incidentCategoryCodeOptions = MOCK.INCIDENT_CATEGORY_CODE_OPTIONS;
  props.formValues = { ...MOCK.INCIDENT };
  props.handlers = { deleteDocument: jest.fn(() => Promise.resolve()) };
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
    const component = shallow(<IncidentForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
