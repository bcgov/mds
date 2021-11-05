import React from "react";
import { shallow } from "enzyme";
import FileUpload from "@/components/common/FileUpload";

const props = {};

const setupProps = () => {
  props.onFileLoad = jest.fn();
  props.onRemoveFile = jest.fn();
  props.addFileStart = jest.fn();
  props.uploadUrl = "mock-url";
  props.acceptedFileTypesMap = {};
  props.maxFileSize = "750MB";
  props.chunkSize = 1048576;
  props.allowRevert = false;
  props.allowMultiple = true;
};

beforeEach(() => {
  setupProps();
});

describe("FileUpload", () => {
  it("renders properly", () => {
    const wrapper = shallow(<FileUpload {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
