import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { reduxForm, reducer as formReducer } from "redux-form";
import { LegalLandOwnerInformation } from "@mds/common/components/projectSummary/LegalLandOwnerInformation";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const mockStore = configureStore({
  form: formReducer,
});

const STATIC_CONTENT = {
  municipalityOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.municipalityOptions,
};

const WrappedLegalLandOwnerInformation = reduxForm({
  form: "ADD_EDIT_PROJECT_SUMMARY",
})(LegalLandOwnerInformation);

describe("LegalLandOwnerInformation Component", () => {
  let store;

  test("renders LegalLandOwnerInformation component", () => {
    store = mockStore({
      form: {
        ADD_EDIT_PROJECT_SUMMARY: {
          values: {},
        },
      },
      STATIC_CONTENT,
    });
    const { container, getByText } = render(
      <Provider store={store}>
        <WrappedLegalLandOwnerInformation />
      </Provider>
    );

    expect(container.querySelector("h3")?.textContent).toBe("Location, Access and Land Use");
    expect(getByText("Is the Applicant the Legal Land Owner?")).toBeDefined();
  });

  test("updates form values when legal applicant is not the legal land owner", () => {
    store = mockStore({
      form: {
        ADD_EDIT_PROJECT_SUMMARY: {
          values: { is_legal_land_owner: false },
        },
      },
      STATIC_CONTENT,
    });
    const { getByText } = render(
      <Provider store={store}>
        <WrappedLegalLandOwnerInformation />
      </Provider>
    );

    const radioButton = getByText("Is the Applicant the Legal Land Owner?");
    fireEvent.click(radioButton);

    const changeAction = store
      .getActions()
      .find(
        (action) =>
          action.type === "@@redux-form/REGISTER_FIELD" &&
          action.payload.name === "legal_land_owner_name"
      );
    expect(changeAction).toBeDefined();
  });

  test("updates form values when legal applicant is the legal land owner", () => {
    store = mockStore({
      form: {
        ADD_EDIT_PROJECT_SUMMARY: {
          values: { is_legal_land_owner: true },
        },
      },
      STATIC_CONTENT,
    });
    const { getByText } = render(
      <Provider store={store}>
        <WrappedLegalLandOwnerInformation />
      </Provider>
    );

    const radioButton = getByText("Is the Applicant the Legal Land Owner?");
    fireEvent.click(radioButton);

    const changeAction = store
      .getActions()
      .find(
        (action) =>
          action.type === "@@redux-form/REGISTER_FIELD" &&
          action.payload.name === "is_crown_land_federal_or_provincial"
      );
    expect(changeAction).toBeUndefined();
  });
});
