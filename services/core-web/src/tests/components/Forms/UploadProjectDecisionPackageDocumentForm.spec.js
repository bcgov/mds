import React from "react";
import { render } from "@testing-library/react";
import { UploadProjectDecisionPackageDocumentForm } from "@/components/Forms/UploadProjectDecisionPackageDocumentForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props = {};

const setupProps = () => {
  props.projectGuid = "ed678588-1e92-4cfc-b2aa-29332931d1ca";
  props.contentTitle = "Upload Document";
  props.instructions = "Click here to upload a document.";
  props.modalType = "decision-package";
  props.formValues = { uploadedFiles: [] };
  props.submitting = false;
  props.onSubmit = jest.fn();
  props.change = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("UploadProjectDecisionPackageDocumentForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><UploadProjectDecisionPackageDocumentForm {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
