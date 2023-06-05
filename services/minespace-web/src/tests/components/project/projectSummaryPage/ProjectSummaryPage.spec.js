import React from "react";
import { shallow } from "enzyme";
import { ProjectSummaryPage } from "@/components/pages/Project/ProjectSummaryPage";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.projectSummaryDocumentTypesHash = MOCK.PROJECT_SUMMARY_DOCUMENT_TYPES_HASH;
  props.mines = {};
  props.fieldsTouched = {};
  props.formattedProjectSummary = {
    mine_guid: "123",
  };
};

const setupDispatchProps = () => {
  dispatchProps.fetchProjectSummaryById = jest.fn(() => Promise.resolve());
  dispatchProps.createProjectSummary = jest.fn(() => Promise.resolve());
  dispatchProps.updateProjectSummary = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      projectGuid: "74120872-74f2-4e27-82e6-878ddb472e5a",
      projectSummaryGuid: "70414192-ca71-4d03-93a5-630491e9c554",
      tab: "basic-information",
    }),
    useLocation: jest.fn().mockReturnValue({
      pathname:
        "/projects/74120872-74f2-4e27-82e6-878ddb472e5a/project-description/70414192-ca71-4d03-93a5-630491e9c554/basic-information",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ProjectSummaryPage", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectSummaryPage {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
