import React from "react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import ProjectDocumentsTab from "./ProjectDocumentsTab";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const initialState = {
  [PROJECTS]: { projects: MOCK.PROJECTS.records, project: MOCK.PROJECT },
};

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
      <ReduxWrapper initialState={initialState}>
        <ProjectDocumentsTab project={MOCK.PROJECT} />
      </ReduxWrapper>
    );

    expect(container).toMatchSnapshot();
  });
});
