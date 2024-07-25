import React from "react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ProjectDocumentsTabSection from "./ProjectDocumentsTabSection";

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      tab: "",
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

describe("ProjectDocumentsTab", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <ProjectDocumentsTabSection
          id="test-id"
          title="Test Title"
          documents={MOCK.PROJECT_SUMMARY.documents}
          onArchivedDocuments={() => Promise.resolve()}
        />
      </ReduxWrapper>
    );

    expect(container).toMatchSnapshot();
  });
});
