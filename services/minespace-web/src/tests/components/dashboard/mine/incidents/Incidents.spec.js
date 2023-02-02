import React from "react";
import { shallow } from "enzyme";
import Incidents from "@/components/dashboard/mine/incidents/Incidents";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchIncidents = jest.fn(() => Promise.resolve());
  dispatchProps.createMineIncident = jest.fn();
  dispatchProps.destroy = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.incidents = MOCK.INCIDENTS.records;
  reducerProps.incidentCategoryCodeOptions = {};
  reducerProps.incidentDeterminationOptions = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MineIncidents", () => {
  it("renders properly", () => {
    const component = shallow(<Incidents {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
