import React from "react";
import { shallow } from "enzyme";
import { MinistryInternalComments } from "@/components/mine/Incidents/MinistryInternalComments";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.createMineIncidentNote = jest.fn();
  dispatchProps.fetchMineIncidentNotes = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.notes = [];
  props.mineIncidentGuid = "04db885d-3e9f-45dd-9383-52bb52be9a7e";
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MinistryInternalComments", () => {
  it("renders properly", () => {
    const component = shallow(<MinistryInternalComments {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
