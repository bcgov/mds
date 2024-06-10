import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { change } from "redux-form";

import { FORM } from "@mds/common";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { reduxForm } from "redux-form";
import { PaymentContact } from "@/components/Forms/projects/projectSummary/PaymentContact";

const mockStore = configureStore([]);
const STATIC_CONTENT = {
  provinceOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.provinceOptions,
};
const initialState = {
  form: {
    [FORM.ADD_EDIT_PROJECT_SUMMARY]: {
      values: {
        payment_contact: {
          address: [{}],
        },
      },
    },
  },
  STATIC_CONTENT,
};

const WrappedPaymentContact = reduxForm({
  form: "ADD_EDIT_PROJECT_SUMMARY",
})(PaymentContact);

describe("PaymentContact Component", () => {
  let store: any;
  beforeEach(() => {
    store = mockStore(initialState);
    store.dispatch = jest.fn();
  });

  test("should render the component with expected fields", () => {
    const { getByText } = render(
      <Provider store={store}>
        <WrappedPaymentContact />
      </Provider>
    );
    expect(getByText(/Contact for Payment/i)).toBeDefined();
    expect(getByText(/Contact for Payment/i)).toBeDefined();
    expect(getByText(/First Name/i)).toBeDefined();
    expect(getByText(/Last Name/i)).toBeDefined();
    expect(getByText(/Contact Number/i)).toBeDefined();
    expect(getByText(/Ext\./i)).toBeDefined();
    expect(getByText(/Email Address/i)).toBeDefined();
    expect(getByText(/Mailing Address/i)).toBeDefined();
    expect(getByText(/Street/i)).toBeDefined();
    expect(getByText(/Unit #/i)).toBeDefined();
    expect(getByText(/Country/i)).toBeDefined();
    expect(getByText(/Province/i)).toBeDefined();
    expect(getByText(/City/i)).toBeDefined();
    expect(getByText(/Postal Code/i)).toBeDefined();
  });

  test("should dispatch change action on useEffect", () => {
    render(
      <Provider store={store}>
        <WrappedPaymentContact />
      </Provider>
    );

    expect(store.dispatch).toHaveBeenCalledWith(
      change(FORM.ADD_EDIT_PROJECT_SUMMARY, "payment_contact.party_type_code", "PER")
    );
  });
});
