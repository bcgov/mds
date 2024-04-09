import React from "react";
import { render, screen } from "@testing-library/react";
import { PROJECT } from "@/tests/mocks/dataMocks";
import ProjectLinks from "@mds/common/components/projects/ProjectLinks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";

const initialState = {
  [PROJECTS]: {
    project: PROJECT,
  },
};

describe("ProjectLinks Component", () => {
  // TODO: there are compilation issues with the component in the common package
  // "Invariant Violation: could not find react-redux context value; please ensure the component is wrapped in a <Provider>"
  // probably needs a fix similar to the webpack.config path resolution to fix in MS
  test.skip("renders ProjectLinks with correct props", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <ProjectLinks viewProject={(record) => ""} />
      </ReduxWrapper>
    );
    expect(screen.queryByText("Related Projects")).toBeTruthy();
    expect(
      screen.queryByText(
        "Link related projects to help with communication with your team and the ministry."
      )
    ).toBeTruthy();
    expect(screen.queryByText("Project Title")).toBeTruthy();
    expect(screen.queryByText(PROJECT.project_links[0].related_project.project_title)).toBeTruthy();
    // Check if status is inactive when either project summary, major mine application, or irt status is WDN
    expect(screen.queryByText("Inactive")).toBeTruthy();
  });
});
