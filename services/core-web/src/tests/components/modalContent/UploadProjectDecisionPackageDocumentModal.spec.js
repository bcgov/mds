import React from "react";
import { render } from "@testing-library/react";
import { UploadProjectDecisionPackageDocumentModal } from "@/components/modalContent/UploadProjectDecisionPackageDocumentModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {};

const setupProps = () => {
  props.projectGuid = "d2f9c5bc-3d69-4557-952b-f0c7ac7faa49";
  props.title = "Upload Document";
  props.instructions = "These are instructions.";
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.change = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("UploadProjectDecisionPackageDocumentModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><UploadProjectDecisionPackageDocumentModal {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
