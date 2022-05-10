import React from "react";
import { shallow } from "enzyme";
import { ProjectOverviewTab } from "@/components/pages/Project/ProjectOverviewTab";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.projectSummaryDocumentTypesHash = MOCK.PROJECT_SUMMARY_DOCUMENT_TYPES_HASH;
  props.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
  props.EMLIcontactInfo = [];
  props.projectSummary = MOCK.PROJECT_SUMMARY;
  props.project = MOCK.PROJECT;
};

beforeEach(() => {
  setupProps();
});

describe("ProjectOverviewTab", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectOverviewTab {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
