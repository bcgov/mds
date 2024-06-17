import React from "react";
import { render } from "@testing-library/react";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { PERMITS, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import ProjectDates from "./ProjectDates";

const initialState = {
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

describe("ProjectDates", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={MOCK.PERMITS}
          onSubmit={() => {}}
        >
          <ProjectDates />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
