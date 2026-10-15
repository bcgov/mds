import React from "react";
import { render, act } from "@testing-library/react";
import { notification } from "antd";
import RenderFileUpload from "./RenderFileUpload";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PDF } from "@mds/common/constants/fileTypes";
import { Field } from "./form";
import FormWrapper from "./FormWrapper";
import { pollDocumentUploadStatus } from "@mds/common/redux/actionCreators/documentActionCreator";

let capturedServer: any;

jest.mock("react-filepond", () => ({
  FilePond: class extends React.Component {
    render() {
      capturedServer = (this.props as any).server;
      return <div data-testid="mock-filepond" />;
    }
  },
  registerPlugin: jest.fn(),
  supported: () => true,
}));

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({ isFeatureEnabled: () => false }),
}));

jest.mock("@mds/common/redux/actionCreators/documentActionCreator", () => ({
  pollDocumentUploadStatus: jest.fn(),
}));

let capturedTusOptions: any;

jest.mock("tus-js-client", () => ({
  Upload: jest.fn().mockImplementation((_file, options) => {
    capturedTusOptions = options;
    return {
      start: jest.fn(),
      abort: jest.fn(),
      url: "http://example.com/uploads/fake-document-guid",
    };
  }),
}));

test("RenderFileUpload component renders correctly", () => {

  const { container: component } = render(
    <ReduxWrapper>
      <FormWrapper name="formName">
        <Field
          id="test-id"
          name="test-name"
          component={RenderFileUpload}
          uploadUrl="upload-url"
          acceptedFileTypesMap={PDF}
          onFileLoad={jest.fn()}
          onRemoveFile={jest.fn()}
          allowRevert
          allowMultiple={true}
          maxFiles={1}
          beforeAddFile={jest.fn()}
          beforeDropFile={jest.fn()}
          onUploadResponse={jest.fn()}
          maxFileSize="400MB"
          label="File Upload Label"
          labelHref="https://example.com"
        />
      </FormWrapper>
    </ReduxWrapper>
  );
  expect(component).toMatchSnapshot();
});

describe("upload status polling", () => {
  const renderFileUpload = (onError: jest.Mock) => {
    render(
      <ReduxWrapper>
        <FormWrapper name="formName">
          <Field
            id="test-id"
            name="test-name"
            component={RenderFileUpload}
            uploadUrl="upload-url"
            acceptedFileTypesMap={PDF}
            onFileLoad={jest.fn()}
            onRemoveFile={jest.fn()}
            onError={onError}
            allowRevert
            allowMultiple={true}
            maxFiles={1}
            beforeAddFile={jest.fn()}
            beforeDropFile={jest.fn()}
            onUploadResponse={jest.fn()}
            maxFileSize="400MB"
            label="File Upload Label"
            labelHref="https://example.com"
          />
        </FormWrapper>
      </ReduxWrapper>
    );
  };

  const startUpload = async (abort: jest.Mock) => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });

    await act(async () => {
      capturedServer.process(
        "test-field",
        file,
        { filepondid: "file-1" },
        jest.fn(),
        jest.fn(),
        jest.fn(),
        abort
      );
    });

    // Simulates the tus-js-client upload finishing, which hands control over
    // to the status-polling loop under test.
    await act(async () => {
      capturedTusOptions.onSuccess();
    });

    return file;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    capturedServer = undefined;
    capturedTusOptions = undefined;
    (pollDocumentUploadStatus as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test("gives up and surfaces an error after repeated polling failures, instead of polling forever", async () => {
    const onError = jest.fn();
    const abort = jest.fn();
    const notificationErrorSpy = jest
      .spyOn(notification, "error")
      .mockImplementation(() => undefined as any);

    (pollDocumentUploadStatus as jest.Mock).mockReturnValue(() => Promise.resolve(undefined));

    renderFileUpload(onError);
    const file = await startUpload(abort);

    // 5 consecutive failed status checks should trip the give-up threshold.
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });

    expect(abort).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(file.name, "Failed to check upload status");
    expect(notificationErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("unable to confirm upload status"),
      })
    );

    // The interval should be cleared, so further polling must not occur.
    (pollDocumentUploadStatus as jest.Mock).mockClear();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });
    expect(pollDocumentUploadStatus).not.toHaveBeenCalled();
  });

  test("does not give up when failures are transient and interspersed with successful checks", async () => {
    const onError = jest.fn();
    const abort = jest.fn();

    let callCount = 0;
    (pollDocumentUploadStatus as jest.Mock).mockImplementation(() => {
      callCount += 1;
      const isFailure = callCount % 2 === 1;
      return () =>
        Promise.resolve(isFailure ? undefined : { data: { status: "In Progress" } });
    });

    renderFileUpload(onError);
    await startUpload(abort);

    // 10 ticks = 5 failures, but none consecutive, so the failure count
    // should reset on each success and never reach the give-up threshold.
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10000);
    });

    expect(abort).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
