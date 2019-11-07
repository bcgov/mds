import React from "react";
import { shallow } from "enzyme";
import { ViewIncidentModal } from "@/components/modalContent/ViewIncidentModal";
import * as Mock from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.incident = Mock.INCIDENT;
  props.incidentStatusCodeHash = Mock.INCIDENT_STATUS_OPTIONS_HASH;
  props.incidentCategoryCodeHash = Mock.INCIDENT_CATEGORY_OPTIONS_HASH;
  props.inspectorsHash = Mock.INSPECTORS_HASH;
  props.incidentDeterminationHash = Mock.INCIDENT_DETERMINATION_HASH;
  props.complianceCodesHash = Mock.HSRCM_HASH;
  props.incidentFollowupActionHash = Mock.INCIDENT_FOLLOWUP_ACTIONS_HASH;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ViewIncidentModal", () => {
  it("renders properly", () => {
    const component = shallow(<ViewIncidentModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
