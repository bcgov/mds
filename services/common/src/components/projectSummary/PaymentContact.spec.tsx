import React from "react";
import { render } from "@testing-library/react";

import { FORM } from "../..";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";

import FormWrapper from "../forms/FormWrapper";
import { PaymentContact } from "./PaymentContact";

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
  [PROJECTS]: {
    project: MOCK.PROJECT,
    projectSummary: MOCK.PROJECT_SUMMARY,
    projects: MOCK.PROJECTS.records,
  },
  [STATIC_CONTENT]: {
    provinceOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.provinceOptions,
  },
};

describe("PaymentContact Component", () => {
  it("should render the component with expected fields", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={MOCK.PERMITS}
          onSubmit={() => {}}
        >
          <PaymentContact isDisabled={false} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
