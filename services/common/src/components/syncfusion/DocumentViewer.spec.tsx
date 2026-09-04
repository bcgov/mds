import React from "react";
import DocumentViewer, { PdfViewer } from "@mds/common/components/syncfusion/DocumentViewer";
import { act, render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

jest.mock("@syncfusion/ej2-react-pdfviewer", () => {
  const actual = jest.requireActual("@syncfusion/ej2-react-pdfviewer");
  return {
    ...actual,
    Inject: () => null,
    PdfViewerComponent: class MockPdfViewerComponent extends React.Component<any> {
      annotation = { clear: jest.fn(), addAnnotation: jest.fn() };
      navigation = { goToPage: jest.fn() };

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
});
