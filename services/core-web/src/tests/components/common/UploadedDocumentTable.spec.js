import React from "react";
import { shallow } from "enzyme";
import UploadedDocumentTable from "@/components/common/UploadedDocumentTable";

let props = {};
let dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.removeFileHandler = jest.fn();
};

const setupProps = () => {
  props.files = [];
  props.showRemove = false;
  props.documentTypeOptionsHash = {};
  props.showCategory = true;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("UploadedDocumentTable", () => {
  it("renders properly", () => {
    const wrapper = shallow(<UploadedDocumentTable {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
