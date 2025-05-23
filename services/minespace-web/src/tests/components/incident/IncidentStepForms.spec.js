import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import StepForms from "@/components/pages/Incidents/IncidentStepForms";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { store } from "@/App";

const props = {
  formIsDirty: false,
  match: {
    params: {
      mineGuid: "5c654fe9-bce5-4ee4-891c-806c46266d54",
      mineIncidentGuid: "4d654fe9-bce5-4ee4-891c-806c46266d55",
    },
  },
  incident: MOCK.INCIDENT,
  isEditMode: false,
  confirmedSubmission: false,
  navigation: { next: jest.fn(), previous: jest.fn() },
  handlers: { save: jest.fn(), deleteDocument: jest.fn(), openModal: jest.fn() },
  formatInitialValues: jest.fn(),
  setConfirmedSubmission: jest.fn(),
  disabledButton: false,
  isFinalReviewStage: false,
};
const dispatchProps = {
  clearMineIncident: jest.fn(() => Promise.resolve()),
  createMineIncident: jest.fn(() => Promise.resolve()),
  fetchMineIncident: jest.fn(() => Promise.resolve()),
  updateMineIncident: jest.fn(() => Promise.resolve()),
  removeDocumentFromMineIncident: jest.fn(() => Promise.resolve()),
  submit: jest.fn(() => Promise.resolve()),
  reset: jest.fn(() => Promise.resolve()),
  touch: jest.fn(() => Promise.resolve()),
  change: jest.fn(() => Promise.resolve()),
  destroy: jest.fn(() => Promise.resolve()),
};

// Objects are not valid as a React child (found: object with keys {title, content, buttons}). If you meant to render a collection of children, use an array instead.
//         in StepForms
describe("IncidentStepForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <StepForms {...props} {...dispatchProps} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
