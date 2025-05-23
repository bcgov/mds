import React from "react";
import { render } from "@testing-library/react";
import { IncidentPage } from "@/components/pages/Incidents/IncidentPage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  incident: MOCK.INCIDENT,
  match: {
    params: {
      mineGuid: "5c654fe9-bce5-4ee4-891c-806c46266d54",
      mineIncidentGuid: "4d654fe9-bce5-4ee4-891c-806c46266d55",
    },
  },
  location: {
    state: { current: 0, mine: MOCK.MINES.mines["18133c75-49ad-4101-85f3-a43e35ae989a"] },
  },
  formValues: {},
  formIsDirty: false,
  closeModal: jest.fn(),
  openModal: jest.fn(),
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
  fetchInspectors: jest.fn(() => Promise.resolve()),
};

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
