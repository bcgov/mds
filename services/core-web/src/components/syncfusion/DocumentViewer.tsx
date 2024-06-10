import React, { useEffect, useRef, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ENVIRONMENT } from "@mds/common";
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
import { createRequestHeader } from "@common/utils/RequestHeaders";
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
} from "@mds/common/redux/selectors/documentViewerSelectors";

import { getDocument, downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";

interface DocumentViewerProps {
  closeDocumentViewer: () => void;
  isDocumentViewerOpen: boolean;
  documentPath: string;
  props: any;
}

const getAjaxRequestSettingsHeaders = (obj) => {
  const ajaxRequestSettingsHeaders = [];
  for (const key in obj) {
    ajaxRequestSettingsHeaders.push({ headerName: key, headerValue: obj[key] });
  }
  return ajaxRequestSettingsHeaders;
};

export const OPENABLE_DOCUMENT_TYPES = ["PDF"];

export const isDocumentOpenable = (documentName) =>
  OPENABLE_DOCUMENT_TYPES.some((type) => documentName.toUpperCase().includes(`.${type}`));

export const openDocument = (documentManagerGuid, documentName) => async (dispatch) => {
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
    })
  );
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  closeDocumentViewer,
  isDocumentViewerOpen,
  documentPath,
  props,
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

  const ajaxRequestSettings = {
    ajaxHeaders: getAjaxRequestSettingsHeaders(createRequestHeader().headers),
    withCredentials: false,
  };

  useEffect(() => {
    if (isDocumentViewerOpen) {
      const modalInst = modal.info({
        title: props.title,
        closable: true,
        open: isDocumentViewerOpen,
        onOk: handleOk,
        onCancel: handleCancel,
        getContainer: () => containerRef.current,
        width: "98%",
        icon: null,
        content: (
          <PdfViewerComponent
            id="pdfviewer-container"
            serviceUrl={pdfViewerServiceUrl}
            documentPath={documentPath}
            ajaxRequestSettings={ajaxRequestSettings}
            style={{ display: "block", height: "80vh" }}
            enableAnnotation={false}
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
        ),
      });

      setModalInstance(modalInst);
    } else {
      if (modalInstance) {
        modalInstance.destroy();
        setModalInstance(null);
      }
    }
  }, [isDocumentViewerOpen]);

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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      closeDocumentViewer,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentViewer);
