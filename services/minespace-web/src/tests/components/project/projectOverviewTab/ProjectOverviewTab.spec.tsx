import React from "react";
import { ProjectOverviewTab } from "@/components/pages/Project/ProjectOverviewTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { MINESPACE, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const initialState = {
  [PROJECTS]: {
    projects: MOCK.PROJECTS.records,
    project: MOCK.PROJECT,
    projectSummary: MOCK.PROJECT_SUMMARY,
    informationRequirementsTable: MOCK.INFORMATION_REQUIREMENTS_TABLE,
  },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
  [MINESPACE]: {
    EMLIContactsByRegion: MOCK.EMLI_CONTACTS_BY_REGION,
  },
};

describe("ProjectOverviewTab", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ProjectOverviewTab navigateForward={() => {}} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
