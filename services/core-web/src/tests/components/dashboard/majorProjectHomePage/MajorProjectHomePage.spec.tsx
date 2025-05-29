import React from "react";
import { render } from "@testing-library/react";
import { MajorProjectHomePage } from "@/components/dashboard/majorProjectHomePage/MajorProjectHomePage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  fetchProjects: jest.fn(() => Promise.resolve({})),
  projectSummaryStatusCodes: jest.fn(),
  informationRequirementsTableStatusCodes: jest.fn(),
  majorMinesApplicationStatusCodes: jest.fn(),
};
const reducerProps = {
  location: { search: " " },
  history: {
    replace: jest.fn(),
    location: {},
  },
  projects: MOCK.MAJOR_PROJECTS_DASHBOARD,
  projectPageData: MOCK.MAJOR_PROJECTS_PAGE_DATA,
};

describe("MajorProjectHomePage", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={{}}>
        <MajorProjectHomePage {...dispatchProps} {...reducerProps} />
      </ReduxWrapper>
    )
    expect(container.firstChild).toMatchSnapshot();
  });
});
