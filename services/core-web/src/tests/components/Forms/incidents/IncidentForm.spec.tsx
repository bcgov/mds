import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import { IncidentForm } from "@/components/Forms/incidents/IncidentForm";
import * as MOCK from "@/tests/mocks/dataMocks";
import { store } from "@/App";
import { MemoryRouter } from "react-router-dom";

const props: any = {};

const setupProps = () => {
  props.incident = MOCK.INCIDENT;
  props.initialValues = MOCK.INCIDENT;
  props.isEditMode = false;
  props.isNewIncident = false;
  props.handleSubmit = jest.fn();
  props.handlers = {
    handleSaveData: jest.fn(() => Promise.resolve()),
    handleFetchData: jest.fn(() => Promise.resolve()),
  };
};

const mockedMineGuid = "1";
const mockedMineIncidentGuid = "2";

beforeEach(() => {
  setupProps();
});

describe("IncidentForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/${mockedMineGuid}/${mockedMineIncidentGuid}`]}>
          <IncidentForm {...props} />
        </MemoryRouter>
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
