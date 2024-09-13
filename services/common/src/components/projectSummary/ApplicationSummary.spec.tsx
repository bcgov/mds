import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PERMITS, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { FORM } from "../..";
import FormWrapper from "../forms/FormWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ApplicationSummary } from "./ApplicationSummary";

const initialState = {
  form: {
    [FORM.ADD_EDIT_PROJECT_SUMMARY]: {
      values: {},
    },
  },
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [PERMITS]: {
    permits: MOCK.PERMITS,
  },
  [STATIC_CONTENT]: {
    projectSummaryPermitTypes: MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryPermitTypes,
    projectSummaryAuthorizationTypes:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryAuthorizationTypes,
  },
};

describe("ApplicationSummary Component", () => {
  it("should render the component with expected fields", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name={FORM.ADD_EDIT_PROJECT_SUMMARY} initialValues={{}} onSubmit={() => {}}>
          <ApplicationSummary />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
