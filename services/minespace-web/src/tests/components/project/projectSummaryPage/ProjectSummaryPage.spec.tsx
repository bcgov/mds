import React from "react";
import { ProjectSummaryPage } from "@/components/pages/Project/ProjectSummaryPage";
import { render } from "@testing-library/react";
import {
  BULK_STATIC_CONTENT_RESPONSE,
  PROJECT,
  PROJECT_SUMMARY,
} from "@mds/common/tests/mocks/dataMocks";
import { PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { REGIONS } from "@/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      projectGuid: "74120872-74f2-4e27-82e6-878ddb472e5a",
      projectSummaryGuid: "70414192-ca71-4d03-93a5-630491e9c554",
      tab: "basic-information",
      mineGuid: "12345678-74f2-4e27-82e6-878ddb472e5a",
    }),
    useLocation: jest.fn().mockReturnValue({
      pathname:
        "/projects/74120872-74f2-4e27-82e6-878ddb472e5a/project-description/70414192-ca71-4d03-93a5-630491e9c554/basic-information",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

const initialState = {
  regions: { regions: REGIONS },
  [PROJECTS]: {
    project: PROJECT,
    projectSummary: PROJECT_SUMMARY,
  },
  [STATIC_CONTENT]: {
    projectSummaryAuthorizationTypes: BULK_STATIC_CONTENT_RESPONSE.projectSummaryAuthorizationTypes,
    projectSummaryDocumentTypes: BULK_STATIC_CONTENT_RESPONSE.projectSummaryDocumentTypes,
  },
};

jest.mock("@/components/Forms/projects/projectSummary/ProjectSummaryForm", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Project Summary Form</div>),
  getProjectFormTabs: jest.fn().mockReturnValue(["mockTab1", "mockTab2"]),
}));

describe("ProjectSummaryPage", () => {
  it("renders properly", async () => {
    const { container, findByText } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ProjectSummaryPage />
        </BrowserRouter>
      </ReduxWrapper>
    );

    await findByText(/Edit project description - Sample title/i);
    expect(container).toMatchSnapshot();
  });
});
