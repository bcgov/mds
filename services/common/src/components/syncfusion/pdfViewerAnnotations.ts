export interface IPdfViewerBoundingBox {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface IPdfViewerAnnotationLocation {
  pageNumber?: number;
  boundingBox?: IPdfViewerBoundingBox;
}

export const addAnnotationToPDFViewer = (
  pdfViewer,
  page?: number,
  boundingBox?: IPdfViewerBoundingBox
) => {
  pdfViewer.annotation.clear();

  if (page) {
    pdfViewer.navigation.goToPage(page);
  }

  if (boundingBox) {
    const { top, right, bottom, left } = boundingBox;
    const topPx = top * 96;
    const rightPx = right * 96;
    const bottomPx = bottom * 96;
    const leftPx = left * 96;
    pdfViewer.annotation.addAnnotation("Polygon", {
      offset: { x: 0, y: 0 },
      pageNumber: page || 0,
      vertexPoints: [
        { x: leftPx, y: topPx },
        { x: rightPx, y: topPx },
        { x: rightPx, y: bottomPx },
        { x: leftPx, y: bottomPx },
        { x: leftPx, y: topPx },
      ],
      isLock: true,
    });
  }
};