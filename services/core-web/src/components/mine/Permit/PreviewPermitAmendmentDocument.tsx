import React, { useEffect } from "react";
import { getDocument } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { PdfViewer } from "@mds/common/components/syncfusion/DocumentViewer";
import { Skeleton } from "antd";
import { IBoundingBox, IPermitAmendment, IPermitCondition } from "@mds/common/interfaces/permits";

interface IPreviewPermitAmendmentDocumentProps {
  amendment: IPermitAmendment;
  documentGuid: string;
  selectedCondition?: IPermitCondition;
}

/**
 * PDF Viewer component for previewing permit amendment documents.
 * Higlights the selected condition on the PDF viewer based on its bounding box.
 */
export const PreviewPermitAmendmentDocument = (props: IPreviewPermitAmendmentDocumentProps) => {
  const [documentUrl, setDocumentUrl] = React.useState<string>(null);
  const [pdfViewer, setPdfViewer] = React.useState(null);

  /**
  * Adds a rectangle annotation to the PDF viewer based on the bounding box and of the selected condition
  */
  const addAnnotationToPDFViewer = (page?: number, boundingBox?: IBoundingBox) => {
    pdfViewer.navigation.goToPage(page || 0);
    if (boundingBox) {
      const { top, right, bottom, left } = boundingBox;
      const topPx = top * 96;
      const rightPx = right * 96;
      const bottomPx = bottom * 96;
      const leftPx = left * 96;
      pdfViewer.annotation.clear();
      pdfViewer.annotation.addAnnotation("Polygon", {
        offset: { x: 0, y: 0 },
        pageNumber: page || 0,
        vertexPoints: [{ x: leftPx, y: topPx }, { x: rightPx, y: topPx }, { x: rightPx, y: bottomPx }, { x: leftPx, y: bottomPx }, { x: leftPx, y: topPx }]
      });
    }
  };

  useEffect(() => {
    // Fetch url of document on load
    if (props.documentGuid) {
      const amdDoc = props.amendment.related_documents.find(d => d.permit_amendment_document_guid === props.documentGuid);

      if (amdDoc) {
        const fetchDocument = async () => {
          const docUrl = await getDocument(amdDoc.document_manager_guid);
          setDocumentUrl(docUrl.object_store_path);
        }

        fetchDocument();
      }
    }
  }, [props.documentGuid]);

  useEffect(() => {
    // Add annotation to PDF viewer when selected condition changes
    if (pdfViewer && props.selectedCondition && props.selectedCondition?.meta) {
      addAnnotationToPDFViewer(props.selectedCondition.meta.page, props.selectedCondition.meta.bounding_box);
    }
  }, [props.selectedCondition]);

  const onInit = (pdfViewer: any) => {
    if (pdfViewer) {
      setPdfViewer(pdfViewer);
    }
  }
  return documentUrl ? <PdfViewer id="preview-permit-amendment-pdf" documentPath={documentUrl} onInit={onInit} /> : <Skeleton />;
};
