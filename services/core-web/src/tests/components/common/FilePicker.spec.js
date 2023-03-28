import React from "react";
import { shallow } from "enzyme";
import FilePicker from "@/components/common/FilePicker";

const props = {};

const setupProps = () => {
  props.maxFileSize = undefined;
  props.acceptedFileTypesMap = undefined;
  props.uploadUrl = "localhost:9999";
  props.existingFilesDropdown = [{ value: "GUID", label: "file" }];
  props.onSelectExisting = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("FilePicker", () => {
  it("renders properly", () => {
    const wrapper = shallow(<FilePicker {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
