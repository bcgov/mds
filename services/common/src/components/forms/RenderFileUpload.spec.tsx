import React from "react";
import { render, fireEvent, waitFor, prettyDOM } from "@testing-library/react";
import FileUpload from "./RenderFileUpload";
import { pollDocumentUploadStatus } from "@mds/common/redux/actionCreators/documentActionCreator";
import { Provider } from "react-redux";
import { store } from "@mds/common/redux/rootState";
import { WatchIgnorePlugin } from "webpack";

// Mock the necessary dependencies
jest.mock("antd", () => {
  const antd = jest.requireActual("antd");
  return {
    ...antd,
    notification: jest.fn(),
  };
});

jest.mock("filepond", () => {
  const FilePond = jest.requireActual("filepond");

  return {
    ...FilePond,
    supported: () => true,
    //     create: jest.fn().mockReturnValue({
    //         ...FilePond.create,
    //         // processFiles: jest.fn(),
    //         // removeFile: jest.fn(),
    //     }),
  };
});

jest.mock("@mds/common/redux/actionCreators/documentActionCreator", () => {
  const documentActionCreator = jest.requireActual(
    "@mds/common/redux/actionCreators/documentActionCreator"
  );

  return {
    ...documentActionCreator,
    pollDocumentUploadStatus: jest.fn().mockResolvedValue({
      data: {
        status: "Success",
      },
    }),
  };
});

describe("FileUpload", () => {
  describe("FileUpload", () => {
    it("should upload file successfully", async () => {
      // Declare the props variable
      const props = {
        onFileLoad: jest.fn(),
        afterSuccess: {
          action: [jest.fn()],
        },
        onInit: jest.fn(),
        importIsSuccessful: jest.fn(),
        addFileStart: jest.fn(),
        labelIdle: "Select File",
      };

      // Render the component
      const { container } = render(
        <Provider store={store}>
          <FileUpload
            {...props}
            uploadUrl="http://localhost"
            acceptedFileTypesMap={{ ".pdf": "application/pdf" }}
          />
        </Provider>
      );

      console.log(prettyDOM(container));

      // Simulate file selection
      const fileInput = container.querySelector("input[name=file]");

      console.log(FileUpload);
      // await waitFor(() => getByLabelText('Select File'), { timeout: 5000 });
      await waitFor(() =>
        fireEvent.change(fileInput, { target: { files: [new File(["test"], "test.txt")] } })
      );

      const pdf = document.getElementsByName("file")[0].files[0];

      expect(pdf.name).toBe("test.txt");
      expect(props.onInit).toHaveBeenCalledTimes(1);

      // // Simulate file upload
      // fireEvent.click(getByLabelText('Upload File'));
      expect(props.addFileStart).toHaveBeenCalledTimes(1);
      // Wait for the upload to complete
      await waitFor(() => expect(pollDocumentUploadStatus).toHaveBeenCalledTimes(1));

      // Assert that the file was loaded
      expect(props.onFileLoad).toHaveBeenCalledTimes(1);
      expect(props.onFileLoad).toHaveBeenCalledWith("test.txt", expect.any(String));

      // Assert that the success action was called
      expect(props.afterSuccess.action[0]).toHaveBeenCalledTimes(1);
      expect(props.importIsSuccessful).toHaveBeenCalledTimes(1);
      expect(props.importIsSuccessful).toHaveBeenCalledWith(true);
    });
  });

  // it('should handle upload error', async () => {
  //     // Mock the upload error
  //     const error = new Error('Upload failed');
  //     server.process.mockRejectedValue(error);

  //     // Render the component
  //     const { getByLabelText } = render(<FileUpload />);

  //     // Simulate file selection
  //     const fileInput = getByLabelText('Select File');
  //     fireEvent.change(fileInput, { target: { files: [new File(['test'], 'test.txt')] } });

  //     // Simulate file upload
  //     fireEvent.click(getByLabelText('Upload File'));

  //     // Wait for the upload to complete
  //     await waitFor(() => expect(pollDocumentUploadStatus).toHaveBeenCalledTimes(1));

  //     // Assert that the error notification was shown
  //     expect(notification.error).toHaveBeenCalledTimes(1);
  //     expect(notification.error).toHaveBeenCalledWith({
  //         message: 'Failed to upload the file: Upload failed',
  //         duration: 10,
  //     });

  //     // Assert that the error action was called
  //     expect(props.importIsSuccessful).toHaveBeenCalledTimes(1);
  //     expect(props.importIsSuccessful).toHaveBeenCalledWith(false, error);
  // });
});
