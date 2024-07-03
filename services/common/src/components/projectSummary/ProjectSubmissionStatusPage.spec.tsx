import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import ProjectSubmissionStatusPage from "./ProjectSubmissionStatusPage";

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      projectGuid: "c6525290-bf4c-42b4-9685-0bd97a71d305",
      status: "success",
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("ProjectSubmissionStatusPage", () => {
  it("renders properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ProjectSubmissionStatusPage />
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
