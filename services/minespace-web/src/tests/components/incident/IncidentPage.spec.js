import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import { IncidentPage } from "@/components/pages/Incidents/IncidentPage";
import * as MOCK from "@/tests/mocks/dataMocks";
import { store } from "@/App";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.incident = MOCK.INCIDENT;
  props.match = {
    params: {
      mineGuid: "5c654fe9-bce5-4ee4-891c-806c46266d54",
      mineIncidentGuid: "4d654fe9-bce5-4ee4-891c-806c46266d55",
    },
  };
  props.location = {
    state: { current: 0, mine: MOCK.MINES.mines["18133c75-49ad-4101-85f3-a43e35ae989a"] },
  };
  props.history = { push: jest.fn(), replace: jest.fn() };
  props.formValues = {};
  props.formIsDirty = false;
};

const setupDispatchProps = () => {
  dispatchProps.clearMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.createMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.updateMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.removeDocumentFromMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.submit = jest.fn(() => Promise.resolve());
  dispatchProps.reset = jest.fn(() => Promise.resolve());
  dispatchProps.touch = jest.fn(() => Promise.resolve());
  dispatchProps.change = jest.fn(() => Promise.resolve());
  dispatchProps.destroy = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("IncidentPage", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <IncidentPage {...props} {...dispatchProps} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
