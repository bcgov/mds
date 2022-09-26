import React from "react";
import { shallow } from "enzyme";
import { MajorProjectHomePage } from "@/components/dashboard/majorProjectHomePage/MajorProjectHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";

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
  reducerProps.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
  reducerProps.informationRequirementsTableStatusCodesHash =
    MOCK.INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_HASH;
  reducerProps.majorMinesApplicationStatusCodesHash =
    MOCK.MAJOR_MINES_APPLICATION_STATUS_CODES_HASH;
  reducerProps.projectSummaryStatusCodes = MOCK.PROJECT_SUMMARY_STATUS_CODES_DROPDOWN;
  reducerProps.informationRequirementsTableStatusCode =
    MOCK.INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_DROPDOWN;
  reducerProps.majorMinesApplicationStatusCodes =
    MOCK.MAJOR_MINES_APPLICATION_STATUS_CODES_DROPDOWN;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MajorProjectHomePage", () => {
  it("renders properly", () => {
    const component = shallow(<MajorProjectHomePage {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
