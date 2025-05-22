import React from "react";
import { render } from "@testing-library/react";
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
    const { container: component } = render(<UploadedDocumentTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
