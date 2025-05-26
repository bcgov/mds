import React from "react";
import { render } from "@testing-library/react";
import UploadedDocumentTable from "@/components/common/UploadedDocumentTable";

const props = {
  files: [],
  showRemove: false,
  documentTypeOptionsHash: {},
  showCategory: true,
};
const dispatchProps = {
  removeFileHandler: jest.fn(),
};

describe("UploadedDocumentTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<UploadedDocumentTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
