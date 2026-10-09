import { documentViewerReducer } from "@mds/common/redux/reducers/documentViewerReducer";
import {
  closeDocumentViewer,
  openDocumentViewer,
} from "@mds/common/redux/actions/documentViewerActions";

const openPayload = {
  props: { title: "report-v1.pdf" },
  documentPath: "mock path",
  documentName: "report-v1.pdf",
};

describe("documentViewerReducer versionId", () => {
  it("stores the object store version when a previous version is opened", () => {
    const result = documentViewerReducer(
      undefined,
      openDocumentViewer({ ...openPayload, versionId: "object-store-version-id" })
    );

    expect(result.versionId).toEqual("object-store-version-id");
  });

  it("defaults versionId to null when the latest version is opened", () => {
    const result = documentViewerReducer(undefined, openDocumentViewer(openPayload));

    expect(result.versionId).toBeNull();
  });

  it("clears versionId when the viewer is closed", () => {
    const opened = documentViewerReducer(
      undefined,
      openDocumentViewer({ ...openPayload, versionId: "object-store-version-id" })
    );

    const result = documentViewerReducer(opened, closeDocumentViewer());

    expect(result.versionId).toBeNull();
  });
});
