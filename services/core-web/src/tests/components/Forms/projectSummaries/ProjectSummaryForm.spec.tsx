import React from "react";
import { render } from "@testing-library/react";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/ProjectSummaryForm";
import * as MOCK from "@/tests/mocks/dataMocks";
import { store } from "@/App";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

const props: any = {};

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
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ProjectSummaryForm {...props} />
        </BrowserRouter>
      </Provider>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
