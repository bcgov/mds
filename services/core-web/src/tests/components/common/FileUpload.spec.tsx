import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import FileUpload from "@/components/common/FileUpload";
import { store } from "@/App";

const setupProps = () => {
  const props = {
    onFileLoad: jest.fn(),
    onRemoveFile: jest.fn(),
    addFileStart: jest.fn(),
    uploadUrl: "mock-url",
    acceptedFileTypesMap: {},
    maxFileSize: "750MB",
    chunkSize: 1048576,
    allowRevert: false,
    allowMultiple: true,
  };
  return props;
};

describe("FileUpload", () => {
  let props;

  beforeEach(() => {
    props = setupProps();
  });

  it("renders properly", () => {
    const { container } = render(
      <Provider store={store}>
        <FileUpload {...props} />
      </Provider>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
