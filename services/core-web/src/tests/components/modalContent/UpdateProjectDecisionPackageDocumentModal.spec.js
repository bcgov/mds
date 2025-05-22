import React from "react";
import { render } from "@testing-library/react";
import { UpdateProjectDecisionPackageDocumentModal } from "@/components/modalContent/UpdateProjectDecisionPackageDocumentModal";

const props = {};

const setupProps = () => {
  props.projectGuid = "d2f9c5bc-3d69-4557-952b-f0c7ac7faa49";
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.submitting = false;
};

beforeEach(() => {
  setupProps();
});

describe("UpdateProjectDecisionPackageDocumentModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<UpdateProjectDecisionPackageDocumentModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
