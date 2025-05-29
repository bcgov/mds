import React from "react";
import { render } from "@testing-library/react";
import { MinistryInternalComments } from "@/components/mine/Incidents/MinistryInternalComments";
import { store } from "@/App";
import { Provider } from "react-redux";

const dispatchProps = {
  createMineIncidentNote: jest.fn(),
  fetchMineIncidentNotes: jest.fn(() => Promise.resolve()),
};
const props = {
  notes: [],
  mineIncidentGuid: "04db885d-3e9f-45dd-9383-52bb52be9a7e",
  isEditMode: false,
};

describe("MinistryInternalComments", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <Provider store={store}>
        <MinistryInternalComments {...dispatchProps} {...props} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
