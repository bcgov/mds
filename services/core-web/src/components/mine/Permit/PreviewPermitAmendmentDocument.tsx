import React, { useEffect } from "react";
import { getDocument } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { PdfViewer, ViewPdf } from "@mds/common/components/syncfusion/DocumentViewer";
import { Skeleton } from "antd";
import { IPermitAmendment, IPermitCondition } from "@mds/common/interfaces/permits";

interface IPreviewPermitAmendmentDocumentProps {
  amendment: IPermitAmendment;
  documentGuid: string;
  selectedCondition?: IPermitCondition;
}

export const PreviewPermitAmendmentDocument = (props: IPreviewPermitAmendmentDocumentProps) => {
  const [documentUrl, setDocumentUrl] = React.useState<string>(null);
  const [pdfViewer, setPdfViewer] = React.useState(null);
  useEffect(() => {
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
    if (pdfViewer && props.selectedCondition) {
      if (props.selectedCondition?.meta) {
        pdfViewer.navigation.goToPage(props.selectedCondition?.meta.page);
        if (props.selectedCondition?.meta.bounding_box) {
          const { top, right, bottom, left } = props.selectedCondition?.meta.bounding_box;
          const topPx = top * 96;
          const rightPx = right * 96;
          const bottomPx = bottom * 96;
          const leftPx = left * 96;
          pdfViewer.annotation.clear();
          pdfViewer.annotation.addAnnotation("Polygon", {
            offset: { x: 0, y: 0 },
            pageNumber: props.selectedCondition.meta.page,
            vertexPoints: [{ x: leftPx, y: topPx }, { x: rightPx, y: topPx }, { x: rightPx, y: bottomPx }, { x: leftPx, y: bottomPx }, { x: leftPx, y: topPx }]
          });
        }
      }
    }
  }, [props.selectedCondition]);

  const onInit = (pdfViewer: any) => {
    if (pdfViewer) {
      setPdfViewer(pdfViewer);
    }
  }
  return documentUrl ? <PdfViewer id="preview-permit-amendment-pdf" documentPath={documentUrl} onInit={onInit} /> : <Skeleton />;
};