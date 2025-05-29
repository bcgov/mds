import React, { FC } from "react";
import { render } from "@testing-library/react";
import StepForms from "@/components/pages/Incidents/IncidentStepForms";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

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

const StepFormsComponent = (props) => {
  return (
    <>
      {(
        StepForms({ ...props }) as {
          title: string;
          content: React.ReactElement;
          buttons: React.ReactElement[];
        }[]
      ).map((step, idx) => (
        <div key={idx}>
          <h2>{step.title}</h2>
          {step.content}
          <div>
            {step.buttons.map((btn, bIdx) => (
              <span key={bIdx}>{btn}</span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

describe("IncidentStepForm", () => {
  it("renders properly", () => {
    const component = render(
      <BrowserRouter>
        <ReduxWrapper>
          <StepFormsComponent {...props} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
