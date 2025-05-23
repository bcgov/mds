import React from "react";
import { render } from "@testing-library/react";
import { UploadProjectDecisionPackageDocumentModal } from "@/components/modalContent/UploadProjectDecisionPackageDocumentModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  projectGuid: "d2f9c5bc-3d69-4557-952b-f0c7ac7faa49",
  title: "Upload Document",
  instructions: "These are instructions.",
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  change: jest.fn(),
};

describe("UploadProjectDecisionPackageDocumentModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><UploadProjectDecisionPackageDocumentModal {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
