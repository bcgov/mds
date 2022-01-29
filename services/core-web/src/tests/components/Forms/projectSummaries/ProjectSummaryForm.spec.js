import React from "react";
import { shallow } from "enzyme";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/ProjectSummaryForm";

const props = {};

const setupProps = () => {
  props.handleSubmit = jest.fn();
  props.submitting = false;
  props.formValues = {};
  props.initialValues = {};
  props.projectSummaryStatusCodesOptions = [];
  props.projectSummaryDocumentTypesOptions = [];
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
