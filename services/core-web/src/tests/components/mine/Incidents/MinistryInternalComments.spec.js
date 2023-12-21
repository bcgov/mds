import React from "react";
import { shallow } from "enzyme";
import { MinistryInternalComments } from "@/components/mine/Incidents/MinistryInternalComments";
import { store } from "@/App";
import { Provider } from "react-redux";

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
    const component = shallow(
      <Provider store={store}>
        <MinistryInternalComments {...dispatchProps} {...props} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
