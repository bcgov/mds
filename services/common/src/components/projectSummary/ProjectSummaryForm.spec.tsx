import React from "react";
import { render } from "@testing-library/react";
import { AUTHENTICATION, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { USER_ACCESS_DATA } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ProjectSummaryForm from "@mds/common/components/projectSummary/ProjectSummaryForm";
import { FORM } from "@mds/common/constants/forms";
import { SystemFlagEnum } from "@mds/common/constants/enums";

const initialState = {
  form: {
    [FORM.ADD_EDIT_PROJECT_SUMMARY]: {
      values: MOCK.PROJECT_SUMMARY,
    },
  },
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [STATIC_CONTENT]: {
    projectSummaryAuthorizationTypes:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryAuthorizationTypes,
  },
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: USER_ACCESS_DATA,
  },
};

const asyncSave = () => new Promise<void>(() => { });

describe("Project Management", () => {
  it("renders properly", async () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ProjectSummaryForm
          initialValues={initialState.form[FORM.ADD_EDIT_PROJECT_SUMMARY].values}
          isEditMode={false}
          handleSaveData={asyncSave}
          handleTabChange={() => { }}
          activeTab={"basic-information"}
        />
      </ReduxWrapper>
    );

    expect(container).toMatchSnapshot();
  });
});
