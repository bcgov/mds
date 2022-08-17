import React from "react";
import { shallow } from "enzyme";
import { MajorMineApplicationFileUpload } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationFileUpload";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.onFileLoad = jest.fn();
  props.onRemoveFile = jest.fn();
  props.acceptedFileTypesMap = { key: "value" };
  props.projectGuid = "1234-asdc-0987";
  props.uploadType = "primary_document";
  props.label = "Upload primary application document";
  props.labelIdle = `<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>`;
  props.allowMultiple = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MajorMineApplicationFileUpload", () => {
  it("renders properly", () => {
    const component = shallow(<MajorMineApplicationFileUpload {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
