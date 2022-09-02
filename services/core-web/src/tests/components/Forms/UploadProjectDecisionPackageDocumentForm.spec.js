import React from "react";
import { shallow } from "enzyme";
import { UploadProjectDecisionPackageDocumentForm } from "@/components/Forms/UploadProjectDecisionPackageDocumentForm";

const props = {};

const setupProps = () => {
  props.projectGuid = "ed678588-1e92-4cfc-b2aa-29332931d1ca";
  props.contentTitle = "Upload Document";
  props.instructions = "Click here to upload a document.";
  props.modalType = "decision-package";
  props.formValues = { uploadedFiles: [] };
  props.submitting = false;
  props.handleSubmit = jest.fn();
  props.change = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("UploadProjectDecisionPackageDocumentForm", () => {
  it("renders properly", () => {
    const component = shallow(<UploadProjectDecisionPackageDocumentForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
