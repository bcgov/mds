import React from "react";
import DocumentViewer, {
  PdfViewer,
  ViewPdf,
  openDocument,
} from "@mds/common/components/syncfusion/DocumentViewer";
import { act, render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import {
  downloadFileFromDocumentManager,
  getDocument,
  getDocumentVersion,
} from "@mds/common/redux/utils/actionlessNetworkCalls";
import { OPEN_DOCUMENT_VIEWER } from "@mds/common/constants/actionTypes";

jest.mock("@mds/common/redux/utils/actionlessNetworkCalls", () => ({
  ...jest.requireActual("@mds/common/redux/utils/actionlessNetworkCalls"),
  getDocument: jest.fn(),
  getDocumentVersion: jest.fn(),
  downloadFileFromDocumentManager: jest.fn(),
}));

jest.mock("@syncfusion/ej2-react-pdfviewer", () => {
  const actual = jest.requireActual("@syncfusion/ej2-react-pdfviewer");
  return {
    ...actual,
    Inject: () => null,
    PdfViewerComponent: class MockPdfViewerComponent extends React.Component<any> {
      annotation = { clear: jest.fn(), addAnnotation: jest.fn() };
      navigation = { goToPage: jest.fn() };
      setJsonData = jest.fn();

      render() {
        return null;
      }
    },
  };
});

const loadDocument = (pdfViewer) => act(() => pdfViewer.props.documentLoad());

const props = {
  documentPath: "mock path name",
  closeDocumentViewer: jest.fn(),
  fetchInspectors: jest.fn(),
  isDocumentViewerOpen: true,
  props: { title: "mock title" },
};

describe("DocumentViewer", () => {
  it("renders properly", () => {
    const component = render(
      <ReduxWrapper>
        <DocumentViewer {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});

describe("PdfViewer", () => {
  const conditionA = { pageNumber: 1, boundingBox: { top: 1, right: 2, bottom: 2, left: 1 } };
  const conditionB = { pageNumber: 3, boundingBox: { top: 4, right: 5, bottom: 6, left: 3 } };

  it("does not touch annotations when no location is ever given (generic document viewer)", () => {
    let pdfViewer;
    render(<PdfViewer documentPath="doc-a" onInit={(scope) => (pdfViewer = scope)} />);
    loadDocument(pdfViewer);

    expect(pdfViewer.annotation.clear).not.toHaveBeenCalled();
    expect(pdfViewer.annotation.addAnnotation).not.toHaveBeenCalled();
  });

  it("draws the annotation once the document has loaded", () => {
    let pdfViewer;
    render(
      <PdfViewer
        documentPath="doc-a"
        annotationLocation={conditionA}
        onInit={(scope) => (pdfViewer = scope)}
      />
    );
    loadDocument(pdfViewer);

    expect(pdfViewer.navigation.goToPage).toHaveBeenCalledWith(1);
    expect(pdfViewer.annotation.addAnnotation).toHaveBeenCalledTimes(1);
  });

  it("redraws the annotation when a new condition is selected, without a fresh document load", () => {
    let pdfViewer;
    const { rerender } = render(
      <PdfViewer
        documentPath="doc-a"
        annotationLocation={conditionA}
        onInit={(scope) => (pdfViewer = scope)}
      />
    );
    loadDocument(pdfViewer);

    act(() => {
      rerender(
        <PdfViewer
          documentPath="doc-a"
          annotationLocation={conditionB}
          onInit={(scope) => (pdfViewer = scope)}
        />
      );
    });

    expect(pdfViewer.navigation.goToPage).toHaveBeenLastCalledWith(3);
    expect(pdfViewer.annotation.addAnnotation).toHaveBeenCalledTimes(2);
  });

  it("clears a previously drawn annotation when the next condition has no location", () => {
    let pdfViewer;
    const { rerender } = render(
      <PdfViewer
        documentPath="doc-a"
        annotationLocation={conditionA}
        onInit={(scope) => (pdfViewer = scope)}
      />
    );
    loadDocument(pdfViewer);

    act(() => {
      rerender(<PdfViewer documentPath="doc-a" onInit={(scope) => (pdfViewer = scope)} />);
    });

    expect(pdfViewer.annotation.addAnnotation).toHaveBeenCalledTimes(1);
    expect(pdfViewer.annotation.clear).toHaveBeenCalledTimes(2);
  });

  it("does not draw on the old document when documentPath and annotationLocation change together", () => {
    let pdfViewer;
    const { rerender } = render(
      <PdfViewer
        documentPath="doc-a"
        annotationLocation={conditionA}
        onInit={(scope) => (pdfViewer = scope)}
      />
    );
    loadDocument(pdfViewer);
    expect(pdfViewer.annotation.addAnnotation).toHaveBeenCalledTimes(1);

    act(() => {
      rerender(
        <PdfViewer
          documentPath="doc-b"
          annotationLocation={conditionB}
          onInit={(scope) => (pdfViewer = scope)}
        />
      );
    });

    expect(pdfViewer.annotation.addAnnotation).toHaveBeenCalledTimes(1);

    loadDocument(pdfViewer);

    expect(pdfViewer.navigation.goToPage).toHaveBeenLastCalledWith(3);
    expect(pdfViewer.annotation.addAnnotation).toHaveBeenCalledTimes(2);
  });
});

describe("ViewPdf", () => {
  const renderViewPdf = (extraProps = {}) => {
    let pdfViewer;
    render(
      <ViewPdf
        pdfViewerServiceUrl="mock-service-url"
        documentPath="doc-a"
        ajaxRequestSettings={{}}
        onInit={(scope) => (pdfViewer = scope)}
        {...extraProps}
      />
    );
    return pdfViewer;
  };

  it("adds the versionId to viewer requests when viewing a previous version", () => {
    const pdfViewer = renderViewPdf({ versionId: "object-store-version-id" });

    pdfViewer.props.ajaxRequestInitiate({ JsonData: { document: "doc-a" } });

    expect(pdfViewer.setJsonData).toHaveBeenCalledWith({
      document: "doc-a",
      versionId: "object-store-version-id",
    });
  });

  it("leaves viewer requests unchanged without a versionId", () => {
    const pdfViewer = renderViewPdf();

    pdfViewer.props.ajaxRequestInitiate({ JsonData: { document: "doc-a" } });

    expect(pdfViewer.setJsonData).not.toHaveBeenCalled();
  });

  it("passes the file name to the viewer's download button", () => {
    let pdfViewer;
    render(
      <PdfViewer
        documentPath="doc-a"
        downloadFileName="report.pdf"
        onInit={(scope) => (pdfViewer = scope)}
      />
    );

    expect(pdfViewer.props.downloadFileName).toEqual("report.pdf");
  });
});

describe("openDocument", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getDocument as jest.Mock).mockResolvedValue({ object_store_path: "mock/object/store/path" });
  });

  it("opens the latest version without looking up a document version", async () => {
    await openDocument("doc-manager-guid", "report.pdf")(dispatch);

    expect(getDocumentVersion).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: OPEN_DOCUMENT_VIEWER,
      payload: expect.objectContaining({
        documentPath: "mock/object/store/path",
        documentName: "report.pdf",
        versionId: null,
      }),
    });
  });

  it("opens a previous version with its object store version", async () => {
    (getDocumentVersion as jest.Mock).mockResolvedValue({
      object_store_version_id: "object-store-version-id",
    });

    await openDocument("doc-manager-guid", "report-v1.pdf", null, "doc-manager-version-guid")(
      dispatch
    );

    expect(getDocumentVersion).toHaveBeenCalledWith("doc-manager-guid", "doc-manager-version-guid");
    expect(dispatch).toHaveBeenCalledWith({
      type: OPEN_DOCUMENT_VIEWER,
      payload: expect.objectContaining({
        documentName: "report-v1.pdf",
        versionId: "object-store-version-id",
      }),
    });
  });

  it("downloads a previous version instead when it has no object store version", async () => {
    (getDocumentVersion as jest.Mock).mockResolvedValue({ object_store_version_id: null });

    await openDocument("doc-manager-guid", "report-v1.pdf", null, "doc-manager-version-guid")(
      dispatch
    );

    expect(dispatch).not.toHaveBeenCalled();
    expect(downloadFileFromDocumentManager).toHaveBeenCalledWith({
      document_manager_guid: "doc-manager-guid",
      document_name: "report-v1.pdf",
      document_manager_version_guid: "doc-manager-version-guid",
    });
  });
});
