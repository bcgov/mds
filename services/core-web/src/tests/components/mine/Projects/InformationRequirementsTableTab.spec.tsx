import React from "react";
import { render } from "@testing-library/react";
import InformationRequirementsTableTab from "@/components/mine/Projects/InformationRequirementsTableTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";

const initialState = {
  [PROJECTS]: {
    projects: MOCK.PROJECTS.records,
    project: MOCK.PROJECT,
    informationRequirementsTable: MOCK.INFORMATION_REQUIREMENTS_TABLE,
    requirements: MOCK.REQUIREMENTS.records,
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      projectGuid: "35633148-57f8-4967-be35-7f89abfbd02e",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("InformationRequirementsTableTab", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <InformationRequirementsTableTab />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
