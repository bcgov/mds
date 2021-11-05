import React from "react";
import { shallow } from "enzyme";
import { UploadPermitDocumentModal } from "@/components/modalContent/UploadPermitDocumentModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "Upload Documents";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("UploadPermitDocumentModal", () => {
  it("renders properly", () => {
    const component = shallow(<UploadPermitDocumentModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
