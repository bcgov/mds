import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS, STATIC_CONTENT, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { FORM } from "../..";
import FormWrapper from "../forms/FormWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { Agent } from "./Agent";

const formValues = {
  values: {
    status_code: "DFT",
    agent: {
      credential_id: 1000,
      party_type_code: null,
      address: { address_type_code: "CAN", sub_division_code: "BC" },
    },
    is_agent: true,
  },
};
const initialState = {
  form: {
    [FORM.ADD_EDIT_PROJECT_SUMMARY]: { values: formValues },
  },
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [STATIC_CONTENT]: {
    provinceOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.provinceOptions,
  },
  [AUTHENTICATION]: {
    systemFlag: "core",
  },
};

describe("Agent Component", () => {
  it("should render the component with expected fields", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={formValues}
          onSubmit={() => { }}
        >
          <Agent fieldsDisabled={false} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
