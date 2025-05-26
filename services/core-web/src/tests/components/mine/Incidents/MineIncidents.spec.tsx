import React from "react";
import { render } from "@testing-library/react";
import MineIncidents from "@/components/mine/Incidents/MineIncidents";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchMineIncidents: jest.fn(() => Promise.resolve()),
  fetchIncidentDocumentTypeOptions: jest.fn(),
  fetchMineIncidentFollowActionOptions: jest.fn(),
  fetchMineIncidentDeterminationOptions: jest.fn(),
  fetchMineIncidentStatusCodeOptions: jest.fn(),
  fetchMineIncidentCategoryCodeOptions: jest.fn(),
  createMineIncident: jest.fn(),
  updateMineIncident: jest.fn(),
  destroy: jest.fn(),
};

const reducerProps = {
  mines: MOCK.MINES.mines,
  mineGuid: MOCK.MINES.mineIds[0],
  mineIncidents: MOCK.INCIDENTS.records,
  followupActions: MOCK.FOLLOWUP_ACTIONS,
  inspectors: MOCK.INSPECTORS.results,
  followupActionsOptions: {},
  incidentDeterminationOptions: {},
  incidentStatusCodeOptions: {},
  incidentCategoryCodeOptions: {},
  doSubparagraphOptions: {},
};

describe("MineIncidents", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><BrowserRouter><MineIncidents {...dispatchProps} {...reducerProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
