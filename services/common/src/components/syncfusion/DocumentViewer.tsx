import React, { useEffect, useRef, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import {
  PdfViewerComponent,
  Toolbar,
  Magnification,
  Navigation,
  LinkAnnotation,
  BookmarkView,
  ThumbnailView,
  Print,
  TextSelection,
  Annotation,
  TextSearch,
  FormFields,
  FormDesigner,
  Inject,
} from "@syncfusion/ej2-react-pdfviewer";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { Modal } from "antd";
import {
  closeDocumentViewer,
  openDocumentViewer,
} from "@mds/common/redux/actions/documentViewerActions";
import {
  getDocumentPath,
  getDocumentName,
  getIsDocumentViewerOpen,
  getProps,
  getLocation,
  getVersionId,
} from "@mds/common/redux/selectors/documentViewerSelectors";

import {
  getDocument,
  getDocumentVersion,
  downloadFileFromDocumentManager,
} from "@mds/common/redux/utils/actionlessNetworkCalls";
import {
  addAnnotationToPDFViewer,
  IPdfViewerAnnotationLocation,
} from "@mds/common/components/syncfusion/pdfViewerAnnotations";

interface DocumentViewerProps {
  closeDocumentViewer: () => void;
  isDocumentViewerOpen: boolean;
  documentPath: string;
  documentName?: string;
  props: any;
  location?: DocumentViewerLocation | null;
  versionId?: string | null;
}

type DocumentViewerLocation = IPdfViewerAnnotationLocation;

const getAjaxRequestSettingsHeaders = (obj) => {
  const ajaxRequestSettingsHeaders = [];
  for (const key in obj) {
    ajaxRequestSettingsHeaders.push({ headerName: key, headerValue: obj[key] });
  }
  return ajaxRequestSettingsHeaders;
};

function getAjaxRequestSettings() {
  return {
    ajaxHeaders: getAjaxRequestSettingsHeaders(createRequestHeader().headers),
    withCredentials: false,
  };
}

export const OPENABLE_DOCUMENT_TYPES = ["PDF"];

export const isDocumentOpenable = (documentName) =>
  OPENABLE_DOCUMENT_TYPES.some((type) => documentName.toUpperCase().includes(`.${type}`));

// Pass documentManagerVersionGuid to view a previous version of a file, otherwise the latest version is opened
export const openDocument = (
  documentManagerGuid,
  documentName,
  location = null,
  documentManagerVersionGuid = null
) => async (dispatch) => {
  const document = {
    document_manager_guid: documentManagerGuid,
    document_name: documentName,
    document_manager_version_guid: documentManagerVersionGuid,
  };

  if (!isDocumentOpenable(documentName)) {
    return downloadFileFromDocumentManager(document);
  }

  const documentRecord = await getDocument(documentManagerGuid);
  const documentPath = documentRecord.object_store_path;
  if (!documentPath) {
    return downloadFileFromDocumentManager(document);
  }

  let versionId = null;
  if (documentManagerVersionGuid) {
    const versionRecord = await getDocumentVersion(documentManagerGuid, documentManagerVersionGuid);
    versionId = versionRecord.object_store_version_id;
    // Without the object store version the viewer would show the latest version, so download the requested version instead
    if (!versionId) {
      return downloadFileFromDocumentManager(document);
    }
  }

  return dispatch(
    openDocumentViewer({
      documentPath,
      documentName,
      props: { title: documentName },
      location,
      versionId,
    })
  );
};

interface ViewPDFProps {
  pdfViewerServiceUrl: string;
  documentPath: string;
  ajaxRequestSettings: any;
  id?: string;
  annotationLocation?: IPdfViewerAnnotationLocation | null;
  onInit?: (pdfViewer: any) => void;
  versionId?: string | null;
  downloadFileName?: string;
}
interface PDFViewerProps {
  documentPath: string;
  id?: string;
  annotationLocation?: IPdfViewerAnnotationLocation | null;
  onInit?: (pdfViewer: any) => void;
  downloadFileName?: string;
}

export const PdfViewer: React.FC<PDFViewerProps> = (props: PDFViewerProps) => {
  const ajaxSettings = getAjaxRequestSettings();

  return <ViewPdf id={props.id} onInit={props.onInit} annotationLocation={props.annotationLocation} pdfViewerServiceUrl={ENVIRONMENT.pdfViewerServiceUrl} documentPath={props.documentPath} ajaxRequestSettings={ajaxSettings} downloadFileName={props.downloadFileName} />;
};

export const ViewPdf: React.FC<ViewPDFProps> = ({
  pdfViewerServiceUrl,
  documentPath,
  ajaxRequestSettings,
  id = "pdfviewer-container",
  annotationLocation = null,
  onInit = null,
  versionId = null,
  downloadFileName,
}) => {
  const pdfViewerRef = useRef<any>(null);
  const [loadedDocumentPath, setLoadedDocumentPath] = useState<string | null>(null);
  const hasDrawnAnnotationRef = useRef(false);

  useEffect(() => {
    setLoadedDocumentPath(null);
    hasDrawnAnnotationRef.current = false;
  }, [documentPath]);

  const { pageNumber, boundingBox } = annotationLocation ?? {};
  const { top, right, bottom, left } = boundingBox ?? {};

  useEffect(() => {
    if (loadedDocumentPath !== documentPath || !pdfViewerRef.current) {
      return;
    }

    if (annotationLocation) {
      hasDrawnAnnotationRef.current = true;
      addAnnotationToPDFViewer(pdfViewerRef.current, pageNumber, boundingBox);
    } else if (hasDrawnAnnotationRef.current) {
      pdfViewerRef.current.annotation.clear();
    }
  }, [loadedDocumentPath, documentPath, pageNumber, top, right, bottom, left]);

  const handleDocumentLoaded = () => {
    setLoadedDocumentPath(documentPath);
  };

  // Tells the PDF viewer service which version of the file to load, it's only sent when viewing a previous version
  const handleAjaxRequestInitiate = (args) => {
    if (versionId && pdfViewerRef.current) {
      pdfViewerRef.current.setJsonData({ ...args.JsonData, versionId });
    }
  };

  return (
    <PdfViewerComponent
      id={id}
      serviceUrl={pdfViewerServiceUrl}
      documentPath={documentPath}
      ajaxRequestSettings={ajaxRequestSettings}
      height="80vh"
      enableAnnotation={true}
      enableFormDesigner={false}
      polygonSettings={{ fillColor: 'yellow', opacity: 0.6, strokeColor: 'orange' }}
      documentLoad={handleDocumentLoaded}
      ajaxRequestInitiate={handleAjaxRequestInitiate}
      // Without this the viewer's download button saves the file as "undefined.pdf", as object store paths have no file extension
      downloadFileName={downloadFileName}
      ref={(scope) => {
        pdfViewerRef.current = scope;

        if (onInit) {
          onInit(scope);
        }
      }}
    >
      <Inject
        services={[
          Toolbar,
          Magnification,
          Navigation,
          Annotation,
          LinkAnnotation,
          BookmarkView,
          ThumbnailView,
          Print,
          TextSelection,
          TextSearch,
          FormFields,
          FormDesigner,
        ]}
      />
    </PdfViewerComponent>
  );
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  closeDocumentViewer,
  isDocumentViewerOpen,
  documentPath,
  documentName,
  props,
  location,
  versionId = null,
}) => {
  const containerRef = useRef(null);
  const [modal, contextHolder] = Modal.useModal();
  const [modalInstance, setModalInstance] = useState(null);

  const pdfViewerServiceUrl = ENVIRONMENT.filesystemProviderUrl.replace(
    "AmazonS3Provider/",
    "PdfViewer"
  );

  const handleOk = () => closeDocumentViewer();
  const handleCancel = () => closeDocumentViewer();

  const ajaxRequestSettings = getAjaxRequestSettings();

  useEffect(() => {
    if (isDocumentViewerOpen) {
      const modalInst = modal.info({
        title: props.title,
        closable: true,
        open: isDocumentViewerOpen,
        onOk: handleOk,
        onCancel: handleCancel,
        getContainer: () => containerRef.current,
        width: "90%",
        icon: null,
        content: (
          <ViewPdf
            pdfViewerServiceUrl={pdfViewerServiceUrl}
            documentPath={documentPath}
            ajaxRequestSettings={ajaxRequestSettings}
            annotationLocation={location}
            versionId={versionId}
            downloadFileName={documentName}
          />
        ),
      });

      setModalInstance(modalInst);
    } else {
      if (modalInstance) {
        modalInstance.destroy();
        setModalInstance(null);
      }
    }
  }, [isDocumentViewerOpen, documentPath, documentName, location, versionId]);

  return (
    <>
      <div ref={containerRef}></div>

      <div>{contextHolder}</div>
    </>
  );
};

const mapStateToProps = (state) => ({
  documentPath: getDocumentPath(state),
  documentName: getDocumentName(state),
  isDocumentViewerOpen: getIsDocumentViewerOpen(state),
  props: getProps(state),
  location: getLocation(state),
  versionId: getVersionId(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      closeDocumentViewer,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentViewer);
