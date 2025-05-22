import React from "react";
import { render } from "@testing-library/react";
import MineIncidents from "@/components/mine/Incidents/MineIncidents";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><BrowserRouter><MineIncidents {...dispatchProps} {...reducerProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
