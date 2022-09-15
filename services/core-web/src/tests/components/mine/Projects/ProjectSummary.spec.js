import React from "react";
import { shallow } from "enzyme";
import { ProjectSummary } from "@/components/mine/Projects/ProjectSummary";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.project = MOCK.PROJECT;
  props.projectSummary = MOCK.PROJECT_SUMMARY;
  props.formattedProjectSummary = MOCK.PROJECT_SUMMARY;
  props.initialValues = MOCK.PROJECT_SUMMARY;
  props.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
  props.projectSummaryDocumentTypesHash = MOCK.PROJECT_SUMMARY_DOCUMENT_TYPES_HASH;
  props.projectSummaryPermitTypesHash = MOCK.PROJECT_SUMMARY_PERMIT_TYPES_HASH;
  props.projectSummaryAuthorizationTypesHash = MOCK.PROJECT_SUMMARY_AUTHORIZATION_TYPES_HASH;
  props.match = {
    params: { mineGuid: "testMineGuid", projectSummaryGuid: "testProjectSummaryGuid" },
  };
};

const setupDispatchProps = () => {
  dispatchProps.fetchProjectSummaryById = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ProjectSummary", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectSummary {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
