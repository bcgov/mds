import React from "react";
import { render, screen } from "@testing-library/react";
import ProjectLinks from "@/components/mine/Projects/ProjectLinks";
import { PROJECT } from "@/tests/mocks/dataMocks";

describe("ProjectLinks Component", () => {
  test("renders ProjectLinksTable with correct props", () => {
    render(<ProjectLinks project={PROJECT} />);
    expect(screen.queryByText("Sub-Projects")).toBeTruthy();
    expect(
      screen.queryByText("Description of sub projects section is displayed here.")
    ).toBeTruthy();
    expect(screen.queryByText("Project Title")).toBeTruthy();
    expect(screen.queryByText(PROJECT.project_links[0].related_project.project_title)).toBeTruthy();
    // Check if status is Active when no project summary, major mine application, or irt status is WDN
    expect(screen.queryByText("Active")).toBeTruthy();
  });
});
