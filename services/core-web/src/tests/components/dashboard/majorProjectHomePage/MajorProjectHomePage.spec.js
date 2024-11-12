import React from "react";
import { render } from "@testing-library/react";
import { MajorProjectHomePage } from "@/components/dashboard/majorProjectHomePage/MajorProjectHomePage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchProjects = jest.fn(() => Promise.resolve({}));
  dispatchProps.projectSummaryStatusCodes = jest.fn();
  dispatchProps.informationRequirementsTableStatusCodes = jest.fn();
  dispatchProps.majorMinesApplicationStatusCodes = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.location = { search: " " };
  reducerProps.history = {
    replace: jest.fn(),
    location: {},
  };
  reducerProps.projects = MOCK.MAJOR_PROJECTS_DASHBOARD;
  reducerProps.projectPageData = MOCK.MAJOR_PROJECTS_PAGE_DATA;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

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
