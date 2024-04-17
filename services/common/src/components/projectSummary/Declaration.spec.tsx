import React from "react";
import { render } from "@testing-library/react";
import Declaration from "./Declaration";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";

const submittedProjectSummary = { ...MOCK.PROJECT_SUMMARY, status_code: "SUB" };

const initialState = {
  [PROJECTS]: {
    projectSummary: submittedProjectSummary,
  },
  [STATIC_CONTENT]: {
    projectSummaryPermitTypes: MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryPermitTypes,
    projectSummaryAuthorizationTypes:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryAuthorizationTypes,
  },
};

describe("Declaration", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={submittedProjectSummary}
          onSubmit={() => {}}
        >
          <Declaration />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
