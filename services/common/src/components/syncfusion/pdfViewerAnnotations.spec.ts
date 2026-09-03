import { addAnnotationToPDFViewer } from "./pdfViewerAnnotations";

const createMockPdfViewer = () => ({
  annotation: {
    clear: jest.fn(),
    addAnnotation: jest.fn(),
  },
  navigation: {
    goToPage: jest.fn(),
  },
});

describe("addAnnotationToPDFViewer", () => {
  it("always clears any previous annotation first", () => {
    const pdfViewer = createMockPdfViewer();

    addAnnotationToPDFViewer(pdfViewer);

    expect(pdfViewer.annotation.clear).toHaveBeenCalledTimes(1);
  });

  it("navigates to the given page", () => {
    const pdfViewer = createMockPdfViewer();

    addAnnotationToPDFViewer(pdfViewer, 3);

    expect(pdfViewer.navigation.goToPage).toHaveBeenCalledWith(3);
  });

  it("does not navigate when no page is given", () => {
    const pdfViewer = createMockPdfViewer();

    addAnnotationToPDFViewer(pdfViewer);

    expect(pdfViewer.navigation.goToPage).not.toHaveBeenCalled();
  });

  it("does not draw an annotation when no bounding box is given", () => {
    const pdfViewer = createMockPdfViewer();

    addAnnotationToPDFViewer(pdfViewer, 3);

    expect(pdfViewer.annotation.addAnnotation).not.toHaveBeenCalled();
  });

  it("draws a locked polygon annotation scaled to the bounding box", () => {
    const pdfViewer = createMockPdfViewer();

    addAnnotationToPDFViewer(pdfViewer, 2, { top: 1, right: 3, bottom: 2, left: 1 });

    expect(pdfViewer.annotation.addAnnotation).toHaveBeenCalledWith(
      "Polygon",
      expect.objectContaining({
        pageNumber: 2,
        isLock: true,
        vertexPoints: [
          { x: 96, y: 96 },
          { x: 288, y: 96 },
          { x: 288, y: 192 },
          { x: 96, y: 192 },
          { x: 96, y: 96 },
        ],
      })
    );
  });
});
