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
} from "@mds/common/redux/selectors/documentViewerSelectors";

import {
  getDocument,
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
  props: any;
  location?: DocumentViewerLocation | null;
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

export const openDocument = (documentManagerGuid, documentName, location = null) => async (dispatch) => {
  const document = {
    document_manager_guid: documentManagerGuid,
    document_name: documentName,
  };

  if (!isDocumentOpenable(documentName)) {
    return downloadFileFromDocumentManager(document);
  }

  const documentRecord = await getDocument(documentManagerGuid);
  const documentPath = documentRecord.object_store_path;
  if (!documentPath) {
    return downloadFileFromDocumentManager(document);
  }

  return dispatch(
    openDocumentViewer({
      documentPath,
      documentName,
      props: { title: documentName },
      location,
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
}
interface PDFViewerProps {
  documentPath: string;
  id?: string;
  annotationLocation?: IPdfViewerAnnotationLocation | null;
  onInit?: (pdfViewer: any) => void;
}

export const PdfViewer: React.FC<PDFViewerProps> = (props: PDFViewerProps) => {
  const ajaxSettings = getAjaxRequestSettings();

  return <ViewPdf id={props.id} onInit={props.onInit} annotationLocation={props.annotationLocation} pdfViewerServiceUrl={ENVIRONMENT.pdfViewerServiceUrl} documentPath={props.documentPath} ajaxRequestSettings={ajaxSettings} />;
};

export const ViewPdf: React.FC<ViewPDFProps> = ({
  pdfViewerServiceUrl,
  documentPath,
  ajaxRequestSettings,
  id = "pdfviewer-container",
  annotationLocation = null,
  onInit = null
}) => {
  const pdfViewerRef = useRef<any>(null);

  const handleDocumentLoaded = () => {
    if (pdfViewerRef.current && annotationLocation) {
      addAnnotationToPDFViewer(
        pdfViewerRef.current,
        annotationLocation.pageNumber,
        annotationLocation.boundingBox
      );
    }
  };

  return (
    <PdfViewerComponent
      id={id}
      serviceUrl={pdfViewerServiceUrl}
      documentPath={documentPath}
      ajaxRequestSettings={ajaxRequestSettings}
      style={{ display: "block", height: "80vh" }}
      enableAnnotation={true}
      enableFormDesigner={false}
      polygonSettings={{ fillColor: 'yellow', opacity: 0.6, strokeColor: 'orange' }}
      documentLoad={handleDocumentLoaded}
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
  props,
  location,
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
  }, [isDocumentViewerOpen, documentPath, location]);

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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      closeDocumentViewer,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentViewer);
