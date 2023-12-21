import React from "react";
import { render } from "@testing-library/react";
import { MineIncident, MineIncidentProps } from "@/components/mine/Incidents/MineIncident";
import * as MOCK from "@/tests/mocks/dataMocks";
import { store } from "@/App";
import { Provider } from "react-redux";

const props: MineIncidentProps = {
  incident: MOCK.INCIDENT,
  formErrors: {},
  formValues: {
    initial_incident_documents: [],
    final_report_documents: [],
    internal_ministry_documents: [],
  },
  formIsDirty: false,
  history: {
    push: jest.fn(),
    replace: jest.fn(),
  },
};
const dispatchProps = {
  submit: jest.fn(),
  touch: jest.fn(),
  change: jest.fn(),
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mineGuid: "448014a5-981f-47b8-8687-4963666776b8",
      mineIncidentGuid: "668014a5-981f-47b8-8687-4963666776b9",
    }),
    useLocation: jest.fn().mockReturnValue({
      pathname:
        "/mines/448014a5-981f-47b8-8687-4963666776b8/incidents/668014a5-981f-47b8-8687-4963666776b9",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

const setupDispatchProps = () => {
  dispatchProps.submit = jest.fn(() => Promise.resolve());
  dispatchProps.touch = jest.fn(() => Promise.resolve());
  dispatchProps.change = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupDispatchProps();
});

describe("MineIncident", () => {
  it("renders properly", () => {
    const { container } = render(
      <Provider store={store}>
        <MineIncident {...props} {...dispatchProps} />
      </Provider>
    );
    expect(container.firstChild.childNodes).toMatchSnapshot();
  });
});
