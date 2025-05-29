import React from "react";
import { render } from "@testing-library/react";
import Project from "@/components/mine/Projects/Project";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import { BrowserRouter } from "react-router-dom";

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      projectGuid: "35633148-57f8-4967-be35-7f89abfbd02e",
      tab: "",
    }),
    useLocation: jest.fn().mockReturnValue({
      hash: ""
    }),
    useHistory: jest.fn().mockReturnValue({
      action: ""
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

const initialState = {
  [PROJECTS]: {
    project: MOCK.PROJECT,
    projects: MOCK.PROJECTS.records
  }
}

describe("Project", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <Project />
        </ReduxWrapper>
      </BrowserRouter>
    );

    expect(component).toMatchSnapshot();
  });
});
