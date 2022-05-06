import React from "react";
import { shallow } from "enzyme";
import { DocumentUpload } from "@/components/Forms/projects/projectSummary/DocumentUpload";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn();
};

const setupProps = () => {
  props.initialValues = {};
  props.documents = {};
  props.isEditMode = true;
  props.projectSummaryDocumentTypesHash = {};
  props.mineGuid = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("DocumentUpload", () => {
  it("renders properly", () => {
    const component = shallow(<DocumentUpload {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
