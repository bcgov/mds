import React from "react";
import { shallow } from "enzyme";
import { MineIncidents } from "@/components/mine/Incidents/MineIncidents";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchMineIncidents = jest.fn();
  dispatchProps.fetchIncidentDocumentTypeOptions = jest.fn();
  dispatchProps.fetchMineIncidentFollowActionOptions = jest.fn();
  dispatchProps.fetchMineIncidentDeterminationOptions = jest.fn();
  dispatchProps.fetchMineIncidentStatusCodeOptions = jest.fn();
  dispatchProps.createMineIncident = jest.fn();
  dispatchProps.updateMineIncident = jest.fn();
  dispatchProps.destroy = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.mineIncidents = MOCK.INCIDENTS.records;
  reducerProps.followupActions = MOCK.FOLLOWUP_ACTIONS;
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
