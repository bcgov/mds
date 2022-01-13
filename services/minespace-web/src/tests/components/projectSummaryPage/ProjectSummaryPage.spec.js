import React from "react";
import { shallow } from "enzyme";
import { ProjectSummaryPage } from "@/components/pages/ProjectSummaryPage";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.projectSummaryDocumentTypesHash = MOCK.PROJECT_SUMMARY_DOCUMENT_TYPES_HASH;
  props.mines = {};
};

const setupDispatchProps = () => {
  dispatchProps.fetchProjectSummaryById = jest.fn(() => Promise.resolve());
  dispatchProps.createProjectSummary = jest.fn(() => Promise.resolve());
  dispatchProps.updateProjectSummary = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
};

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
