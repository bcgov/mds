import React from "react";
import { shallow } from "enzyme";
import { UploadProjectDecisionPackageDocumentModal } from "@/components/modalContent/UploadProjectDecisionPackageDocumentModal";

const props = {};

const setupProps = () => {
  props.projectGuid = "d2f9c5bc-3d69-4557-952b-f0c7ac7faa49";
  props.title = "Upload Document";
  props.instructions = "These are instructions.";
  props.handleSubmit = jest.fn();
  props.closeModal = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("UploadProjectDecisionPackageDocumentModal", () => {
  it("renders properly", () => {
    const component = shallow(<UploadProjectDecisionPackageDocumentModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
