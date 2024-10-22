import React from "react";
import ProjectPage from "@/components/pages/Project/ProjectPage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROJECTS, MINES } from "@mds/common/constants/reducerTypes";

const initialState = {
  [PROJECTS]: {
    projects: MOCK.PROJECTS.records,
    project: MOCK.PROJECT,
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [MINES]: MOCK.MINES,
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      tab: "overview",
      projectGuid: "35633148-57f8-4967-be35-7f89abfbd02e",
    }),
    useLocation: jest.fn().mockReturnValue({
      hash: "",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      location: { hash: "" },
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("ProjectPage", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ProjectPage />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
