import React from "react";
import { render } from "@testing-library/react";
import { ProjectOverviewTab } from "@/components/mine/Projects/ProjectOverviewTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const initialState = {
  [PROJECTS]: {
    projects: MOCK.PROJECTS.records,
    project: MOCK.PROJECT,
    projectSummary: MOCK.PROJECT_SUMMARY,
    informationRequirementsTable: MOCK.INFORMATION_REQUIREMENTS_TABLE,
  },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
};

describe("ProjectOverviewTab", () => {
  it("renders properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <ProjectOverviewTab />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
