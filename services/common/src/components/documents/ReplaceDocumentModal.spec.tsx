import React from "react";
import ReplaceDocumentModal from "@mds/common/components/documents/ReplaceDocumentModal";
import { fireEvent, render, act, waitFor } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINEDOCUMENTS } from "@mds/common/tests/mocks/dataMocks";
import { MajorMineApplicationDocument, MineDocument } from "@mds/common/models/documents/document";
import { notification } from "antd";
import * as docActions from "@mds/common/redux/actionCreators/documentActionCreator";

let capturedFileUploadProps: any = {};
let capturedFormSubmit: any = null;

jest.mock("@mds/common/components/forms/RenderFileUpload", () => {
  const actual = jest.requireActual("@mds/common/components/forms/RenderFileUpload").default;
  return (props: any) => {
    capturedFileUploadProps = props;
    return actual(props);
  };
});

jest.mock("@mds/common/components/forms/EditForm", () => {
  const actual = jest.requireActual("@mds/common/components/forms/EditForm");
  const Component = actual.default || actual;
  return (props: any) => {
    capturedFormSubmit = props.onSubmit;
    return <Component {...props} />;
  };
});

describe("ReplaceDocumentModal", () => {
  beforeEach(() => {
    capturedFileUploadProps = {};
    jest.clearAllMocks();
  });

  it("renders correctly and matches the snapshot", () => {
    const { container } = render(
      <ReduxWrapper>
        <ReplaceDocumentModal
          document={new MineDocument(MINEDOCUMENTS.records[0])}
          handleSubmit={jest.fn().mockReturnValue(Promise.resolve())}
          alertMessage="This is a test alert message."
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("maintains newest-first version ordering when a document is versioned and replaced", () => {
    const originalDoc = new MineDocument({
      ...MINEDOCUMENTS.records[0],
      document_name: "Original.pdf",
      versions: [
        {
          mine_document_version_guid: "v1-guid",
          document_name: "V1.pdf",
          upload_date: "2024-01-01",
        },
      ],
    });

    expect(originalDoc.versions).toHaveLength(1);
    expect(originalDoc.versions[0].document_name).toBe("V1.pdf");

    const connectedVersionV2 = {
      mine_document_version_guid: "v2-guid",
      document_name: "Original.pdf",
      upload_date: "2024-02-01",
    };

    const existingVersionsAsc = (originalDoc.versions ?? []).slice().reverse();
    const newVersionsChronological = [...existingVersionsAsc, connectedVersionV2 as any];

    const replacedDoc = new MineDocument({
      ...originalDoc,
      document_name: "Replacement.pdf",
      versions: newVersionsChronological,
    });

    expect(replacedDoc.document_name).toBe("Replacement.pdf");
    expect(replacedDoc.number_prev_versions).toBe(2);
    expect(replacedDoc.versions[0].document_name).toBe("Original.pdf");
    expect(replacedDoc.versions[1].document_name).toBe("V1.pdf");
  });

  it("handles beforeUpload validation when file extension does not match", async () => {
    const errorSpy = jest.spyOn(notification, "error").mockImplementation();
    render(
      <ReduxWrapper>
        <ReplaceDocumentModal
          document={new MineDocument(MINEDOCUMENTS.records[0])}
          handleSubmit={jest.fn().mockReturnValue(Promise.resolve())}
          alertMessage="Alert"
        />
      </ReduxWrapper>
    );

    let result;
    await act(async () => {
      result = await capturedFileUploadProps.beforeAddFile({
        fileExtension: "png",
        filename: "wrong.png",
      });
    });

    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "The selected file type does not match the original document",
      })
    );
  });

  it("handles successful file upload flow, updates state, and submits new version preserving subclass", async () => {
    const handleSubmit = jest.fn().mockReturnValue(Promise.resolve());
    const originalDoc = new MajorMineApplicationDocument({
      ...MINEDOCUMENTS.records[0],
      file_type: ".pdf",
      document_name: "original.pdf",
      versions: [
        {
          mine_document_version_guid: "v1-guid",
          document_name: "v1.pdf",
          upload_date: "2024-01-01",
        } as any,
      ],
    });

    jest.spyOn(docActions, "postNewDocumentVersion").mockReturnValue((() =>
      Promise.resolve({
        data: {
          mine_document_version_guid: "v2-guid",
          document_name: "original.pdf",
          upload_date: "2024-02-01",
        },
      })) as any);

    const { container } = render(
      <ReduxWrapper>
        <ReplaceDocumentModal
          document={originalDoc}
          handleSubmit={handleSubmit}
          alertMessage="Alert"
        />
      </ReduxWrapper>
    );

    // 1. beforeUpload with valid extension
    let validBeforeUpload;
    await act(async () => {
      validBeforeUpload = await capturedFileUploadProps.beforeAddFile({
        fileExtension: "pdf",
        filename: "replacement.pdf",
      });
    });
    expect(validBeforeUpload).toBe(true);

    // 2. onFileLoad and onUploadResponse
    act(() => {
      capturedFileUploadProps.onFileLoad("replacement.pdf", "doc-man-guid");
      capturedFileUploadProps.onUploadResponse({
        document_manager_version_guid: "ver-guid-123",
      });
    });

    // 3. Submit form
    expect(capturedFormSubmit).toBeDefined();
    await act(async () => {
      await capturedFormSubmit();
    });

    expect(handleSubmit).toHaveBeenCalled();

    const replacedDoc = handleSubmit.mock.calls[0][0];
    expect(replacedDoc).toBeInstanceOf(MajorMineApplicationDocument);
    expect(replacedDoc.document_name).toBe("replacement.pdf");
    expect(replacedDoc.versions).toHaveLength(2);
  });

  it("handles onRemoveFile callback and fallback when file_type is unknown", async () => {
    const docWithoutFileType = new MineDocument({
      ...MINEDOCUMENTS.records[0],
      file_type: null,
    });

    render(
      <ReduxWrapper>
        <ReplaceDocumentModal
          document={docWithoutFileType}
          handleSubmit={jest.fn().mockReturnValue(Promise.resolve())}
          alertMessage="Alert"
        />
      </ReduxWrapper>
    );

    act(() => {
      capturedFileUploadProps.onRemoveFile(null, {});
    });
  });
});
