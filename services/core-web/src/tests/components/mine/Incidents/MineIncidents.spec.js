import React from "react";
import { shallow } from "enzyme";
import MineIncidents from "@/components/mine/Incidents/MineIncidents";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchMineIncidents = jest.fn(() => Promise.resolve());
  dispatchProps.fetchIncidentDocumentTypeOptions = jest.fn();
  dispatchProps.fetchMineIncidentFollowActionOptions = jest.fn();
  dispatchProps.fetchMineIncidentDeterminationOptions = jest.fn();
  dispatchProps.fetchMineIncidentStatusCodeOptions = jest.fn();
  dispatchProps.fetchMineIncidentCategoryCodeOptions = jest.fn();
  dispatchProps.createMineIncident = jest.fn();
  dispatchProps.updateMineIncident = jest.fn();
  dispatchProps.destroy = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mines = MOCK.MINES.mines;
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
  reducerProps.mineIncidents = MOCK.INCIDENTS.records;
  reducerProps.followupActions = MOCK.FOLLOWUP_ACTIONS;
  reducerProps.inspectors = MOCK.INSPECTORS.results;
  reducerProps.followupActionsOptions = {};
  reducerProps.incidentDeterminationOptions = {};
  reducerProps.incidentStatusCodeOptions = {};
  reducerProps.incidentCategoryCodeOptions = {};
  reducerProps.doSubparagraphOptions = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MineIncidents", () => {
  it("renders properly", () => {
    const component = shallow(<MineIncidents {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
