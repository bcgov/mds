import React from "react";
import { shallow } from "enzyme";
import { ProjectSummaryForm } from "@/components/Forms/projectSummaries/ProjectSummaryForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.handleSubmit = jest.fn();
  props.submitting = false;
  props.formValues = { contacts: [{}] };
  props.initialValues = {
    projectSummaryAuthorizationTypes: [],
    authorizations: [],
  };
  props.projectSummary = { documents: [], contacts: [{}] };
  props.projectSummaryDocumentTypesHash = {};
  props.projectSummaryPermitTypesHash = {};
  props.projectSummaryAuthorizationTypesHash = {};
  props.project = MOCK.PROJECT;
  props.projectLeads = [
    { groupName: "Active", opt: [] },
    { groupName: "Inactive", opt: [] },
  ];
  props.projectSummaryStatusCodes = [];
  props.userRoles = [];
};

beforeEach(() => {
  setupProps();
});

describe("ProjectSummaryForm", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectSummaryForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
