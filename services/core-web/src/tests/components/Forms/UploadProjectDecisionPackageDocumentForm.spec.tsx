import React from "react";
import { render } from "@testing-library/react";
import { UploadProjectDecisionPackageDocumentForm } from "@/components/Forms/UploadProjectDecisionPackageDocumentForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props = {
  projectGuid: "ed678588-1e92-4cfc-b2aa-29332931d1ca",
  contentTitle: "Upload Document",
  instructions: "Click here to upload a document.",
  modalType: "decision-package",
  formValues: { uploadedFiles: [] },
  submitting: false,
  onSubmit: jest.fn(),
  change: jest.fn(),
};

describe("UploadProjectDecisionPackageDocumentForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <UploadProjectDecisionPackageDocumentForm {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
