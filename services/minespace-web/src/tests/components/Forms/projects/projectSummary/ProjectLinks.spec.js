import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import ProjectLinks from "@/components/Forms/projects/projectSummary/ProjectLinks";
import { PROJECT } from "@/tests/mocks/dataMocks";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

describe("ProjectLinks Component", () => {
  beforeEach(() => {
    useSelector.mockReturnValue(PROJECT);
  });

  afterEach(() => {
    useSelector.mockClear();
  });

  test("renders ProjectLinksTable with correct props", () => {
    render(<ProjectLinks />);
    expect(screen.queryByText("Related Projects")).toBeTruthy();
    expect(
      screen.queryByText(
        "Link related projects to help with communication with your team and the ministry."
      )
    ).toBeTruthy();
    expect(screen.queryByText("Project Title")).toBeTruthy();
    expect(screen.queryByText(PROJECT.project_links[0].related_project.project_title)).toBeTruthy();
  });
});
