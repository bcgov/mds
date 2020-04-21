import React from "react";
import { shallow } from "enzyme";
import { EditFinalPermitDocumentPackage } from "@/components/modalContent/EditFinalPermitDocumentPackage";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.documents = [];
  props.finalDocuments = [];
  props.mineGuid = "";
  props.noticeOfWorkGuid = "";
  props.documentDownloadState = { downloading: false, currentFile: 1, totalFiles: 1 };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditFinalPermitDocumentPackage", () => {
  it("renders properly", () => {
    const component = shallow(<EditFinalPermitDocumentPackage {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
