import React from "react";
import { render } from "@testing-library/react";
import { ProjectSummary } from "@/components/mine/Projects/ProjectSummary";
import * as MOCK from "@/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";

const initialState = {
  [PROJECTS]: {
    projects: [MOCK.PROJECT],
    project: MOCK.PROJECT,
    projectSummaries: [MOCK.PROJECT_SUMMARY],
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
};

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: jest.fn().mockImplementation(() => {
    return {
      mineGuid: "123",
      projectSummaryGuid: MOCK.PROJECT_SUMMARY.project_summary_guid,
      projectGuid: MOCK.PROJECT.project_guid,
      tab: "basic-information",
    };
  }),
  useLocation: jest.fn().mockImplementation(() => {
    return {
      pathname: `/pre-applications/${MOCK.PROJECT.project_guid}/project-description/${MOCK.PROJECT_SUMMARY.project_summary_guid}`,
    };
  }),
}));

describe("ProjectSummary", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ProjectSummary />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
