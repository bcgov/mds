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

interface DocumentViewerProps {
  closeDocumentViewer: () => void;
  isDocumentViewerOpen: boolean;
  documentPath: string;
  props: any;
  location?: DocumentViewerLocation | null;
}

interface DocumentViewerBoundingBox {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

interface DocumentViewerLocation {
  pageNumber?: number;
  boundingBox?: DocumentViewerBoundingBox;
}

const AUTO_HIGHLIGHT_CLASS = "mds-document-viewer-auto-highlight";

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

const toFiniteNumber = (value): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const clearAutoHighlights = (root: ParentNode = document) => {
  root
    .querySelectorAll(`.${AUTO_HIGHLIGHT_CLASS}`)
    .forEach((element) => element.parentElement?.removeChild(element));
};

const navigateToRequestedPage = (pdfViewer, pageNumber?: number) => {
  if (!pageNumber || pageNumber < 1) {
    return;
  }

  if (pdfViewer?.navigation?.goToPage) {
    pdfViewer.navigation.goToPage(pageNumber);
    return;
  }

  if (pdfViewer?.viewerBase?.updateScrollTop) {
    pdfViewer.viewerBase.updateScrollTop(pageNumber - 1, true);
  }
};

const renderBoundingBoxHighlight = (pdfViewer, location?: DocumentViewerLocation | null) => {
  if (!location?.boundingBox) {
    return;
  }

  const leftInches = toFiniteNumber(location.boundingBox.left);
  const topInches = toFiniteNumber(location.boundingBox.top);
  const rightInches = toFiniteNumber(location.boundingBox.right);
  const bottomInches = toFiniteNumber(location.boundingBox.bottom);

  if (
    leftInches === null ||
    topInches === null ||
    rightInches === null ||
    bottomInches === null ||
    rightInches <= leftInches ||
    bottomInches <= topInches
  ) {
    return;
  }

  const pageIndexFromLocation =
    typeof location.pageNumber === "number" && location.pageNumber > 0
      ? location.pageNumber - 1
      : null;

  let attempts = 0;
  const maxAttempts = 20;
  const tryRender = () => {
    attempts += 1;

    const fallbackPageIndex =
      typeof pdfViewer?.currentPageNumber === "number" ? pdfViewer.currentPageNumber - 1 : 0;
    const pageIndex = pageIndexFromLocation ?? fallbackPageIndex;
    const pageDiv = document.getElementById(`${pdfViewer?.element?.id}_pageDiv_${pageIndex}`);
    const pageSize = pdfViewer?.viewerBase?.pageSize?.[pageIndex];

    if (!pageDiv || !pageSize) {
      if (attempts < maxAttempts) {
        window.setTimeout(tryRender, 150);
      }
      return;
    }

    const pageWidth = toFiniteNumber(pageSize.width);
    const pageHeight = toFiniteNumber(pageSize.height);
    if (!pageWidth || !pageHeight) {
      return;
    }

    const leftRatio = clamp((leftInches * 72) / pageWidth, 0, 1);
    const topRatio = clamp((topInches * 72) / pageHeight, 0, 1);
    const rightRatio = clamp((rightInches * 72) / pageWidth, 0, 1);
    const bottomRatio = clamp((bottomInches * 72) / pageHeight, 0, 1);
    const widthRatio = rightRatio - leftRatio;
    const heightRatio = bottomRatio - topRatio;

    if (widthRatio <= 0 || heightRatio <= 0) {
      return;
    }

    clearAutoHighlights(pageDiv);

    const highlight = document.createElement("div");
    highlight.className = AUTO_HIGHLIGHT_CLASS;
    highlight.style.position = "absolute";
    highlight.style.pointerEvents = "none";
    highlight.style.left = `${leftRatio * 100}%`;
    highlight.style.top = `${topRatio * 100}%`;
    highlight.style.width = `${widthRatio * 100}%`;
    highlight.style.height = `${heightRatio * 100}%`;
    highlight.style.border = "2px solid #fa8c16";
    highlight.style.background = "rgba(255, 241, 184, 0.45)";
    highlight.style.borderRadius = "2px";
    highlight.style.zIndex = "12";
    pageDiv.appendChild(highlight);
  };

  window.setTimeout(tryRender, 100);
};

const applyDocumentLocation = (pdfViewer, location?: DocumentViewerLocation | null) => {
  if (!location) {
    return;
  }

  clearAutoHighlights();
  navigateToRequestedPage(pdfViewer, location.pageNumber);
  renderBoundingBoxHighlight(pdfViewer, location);
};

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
  onInit?: (pdfViewer: any) => void;
}
interface PDFViewerProps {
  documentPath: string;
  id?: string;
  onInit?: (pdfViewer: any) => void;
}

export const PdfViewer: React.FC<PDFViewerProps> = (props: PDFViewerProps) => {
  const ajaxSettings = getAjaxRequestSettings();

  return <ViewPdf id={props.id} onInit={props.onInit} pdfViewerServiceUrl={ENVIRONMENT.pdfViewerServiceUrl} documentPath={props.documentPath} ajaxRequestSettings={ajaxSettings} />;
};

export const ViewPdf: React.FC<ViewPDFProps> = ({
  pdfViewerServiceUrl,
  documentPath,
  ajaxRequestSettings,
  id = "pdfviewer-container",
  onInit = null
}) => {
  let pdfViewer;
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
      ref={(scope) => {
        pdfViewer = scope;

        if (onInit) {
          onInit(pdfViewer);
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
            onInit={(pdfViewer) => applyDocumentLocation(pdfViewer, location)}
          />
        ),
      });

      setModalInstance(modalInst);
    } else {
      if (modalInstance) {
        modalInstance.destroy();
        setModalInstance(null);
      }
      clearAutoHighlights();
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
