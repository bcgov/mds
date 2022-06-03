import React from "react";
import { shallow } from "enzyme";
import { ProjectOverviewTab } from "@/components/mine/Projects/ProjectOverviewTab";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.projectSummaryDocumentTypesHash = MOCK.PROJECT_SUMMARY_DOCUMENT_TYPES_HASH;
  props.projectSummaryStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_ALIAS_CODES_HASH;
  props.project = MOCK.PROJECT;
};

beforeEach(() => {
  setupProps();
});

describe("ProjectOverviewTab", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectOverviewTab {...props} />);
    expect(component).toMatchSnapshot();
  });
});
