import React from "react";
import { render } from "@testing-library/react";
import { AUTHENTICATION, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { FORM, SystemFlagEnum } from "@mds/common/index";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ProjectManagement } from "@mds/common/components/projectSummary/ProjectManagement";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { USER_ACCESS_DATA } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { subDays } from "date-fns";
import { UTCDate } from "@date-fns/utc";

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
    projectSummaryMinistryComments: MOCK.PROJECT_SUMMARY_MINISTRY_COMMENTS.map((comment) => {
      return {
        ...comment,
        update_timestamp: subDays(new UTCDate(), 10).toISOString(),
        create_timestamp: subDays(new UTCDate(), 10).toISOString(),
      };
    }),
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
    const { container, findAllByText } = render(
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
