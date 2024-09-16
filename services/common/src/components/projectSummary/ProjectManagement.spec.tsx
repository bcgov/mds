import React from "react";
import { render, screen } from "@testing-library/react";
import { AUTHENTICATION, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { FORM, SystemFlagEnum } from "@mds/common/index";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ProjectManagement } from "@mds/common/components/projectSummary/ProjectManagement";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { waitFor } from "@mds/core-web/src/components/common/downloads/helpers";
import { USER_ACCESS_DATA } from "@mds/common/tests/mocks/dataMocks";

const initialState = {
  form: {
    [FORM.ADD_EDIT_PROJECT_SUMMARY]: {
      values: {
        status_code: "ASG",
        project_summary_guid: MOCK.PROJECT_SUMMARY.project_summary_guid,
        project_lead_party_guid: MOCK.PROJECT_SUMMARY.project_lead_party_guid,
      },
    },
  },
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
    projectSummaryMinistryComments: MOCK.PROJECT_SUMMARY_MINISTRY_COMMENTS,
  },
  [STATIC_CONTENT]: {
    provinceOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.provinceOptions,
    projectSummaryStatusCodes: MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryStatusCodes,
  },
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: USER_ACCESS_DATA,
  },
};

describe("Project Management", () => {
  it("renders properly", async () => {
    const { container, findAllByText, getByDisplayValue, findByTestId } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={initialState.form[FORM.ADD_EDIT_PROJECT_SUMMARY].values}
          onSubmit={() => {}}
        >
          <ProjectManagement />
        </FormWrapper>
      </ReduxWrapper>
    );

    const commentText = await findAllByText(/this is a comment/i);
    expect(commentText[0]).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });
});
