import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { IncidentForm } from "@/components/Forms/incidents/IncidentForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { store } from "@/App";
import { MemoryRouter } from "react-router-dom";

const props: any = {
  incident: MOCK.INCIDENT,
  initialValues: MOCK.INCIDENT,
  isEditMode: false,
  isNewIncident: false,
  handleSubmit: jest.fn(),
  handlers: {
    handleSaveData: jest.fn(() => Promise.resolve()),
    handleFetchData: jest.fn(() => Promise.resolve()),
  },
};

const mockedMineGuid = "1";
const mockedMineIncidentGuid = "2";

describe("IncidentForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/${mockedMineGuid}/${mockedMineIncidentGuid}`]}>
          <IncidentForm {...props} />
        </MemoryRouter>
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
