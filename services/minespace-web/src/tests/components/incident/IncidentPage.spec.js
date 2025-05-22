import React from "react";
import { render } from "@testing-library/react";
import { IncidentPage } from "@/components/pages/Incidents/IncidentPage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
  props.formValues = {};
  props.formIsDirty = false;
  props.closeModal = jest.fn();
  props.openModal = jest.fn();
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
  dispatchProps.fetchInspectors = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
    }),
    useHistory: jest.fn(),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("IncidentPage", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper>
          <IncidentPage {...dispatchProps} {...props} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
