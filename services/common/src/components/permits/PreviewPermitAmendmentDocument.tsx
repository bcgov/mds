import React, { useEffect } from "react";
import { getDocument } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { PdfViewer } from "@mds/common/components/syncfusion/DocumentViewer";
import { Skeleton } from "antd";
import { IPermitAmendment, IPermitCondition } from "@mds/common/interfaces/permits";

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

  const annotationLocation = props.selectedCondition?.meta
    ? {
      pageNumber: props.selectedCondition.meta.page,
      boundingBox: props.selectedCondition.meta.bounding_box,
    }
    : null;

  return documentUrl ? <PdfViewer id="preview-permit-amendment-pdf" documentPath={documentUrl} annotationLocation={annotationLocation} /> : <Skeleton />;
};
