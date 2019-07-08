import React from "react";
import { shallow } from "enzyme";
import { MineIncidentTable } from "@/components/mine/Incidents/MineIncidentTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleEditMineIncident = jest.fn();
  dispatchProps.openMineIncidentModal = jest.fn();
  dispatchProps.openViewMineIncidentModal = jest.fn();
};

const setupProps = () => {
  props.followupActions = MOCK.FOLLOWUP_ACTIONS;
  props.incidents = MOCK.INCIDENTS.mine_incidents;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineIncidentTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineIncidentTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
