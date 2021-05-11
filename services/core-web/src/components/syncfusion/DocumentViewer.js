import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { ENVIRONMENT } from "@common/constants/environment";
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
  Inject,
} from "@syncfusion/ej2-react-pdfviewer";
import { createRequestHeader } from "@common/utils/RequestHeaders";
import { Modal } from "antd";
import { closeDocumentViewer, openDocumentViewer } from "@common/actions/documentViewerActions";
import {
  getDocumentPath,
  getIsDocumentViewerOpen,
  getProps,
} from "@common/selectors/documentViewerSelectors";

import { getDocument, downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";

const propTypes = {
  closeDocumentViewer: PropTypes.func.isRequired,
  isDocumentViewerOpen: PropTypes.bool.isRequired,
  documentPath: PropTypes.string.isRequired,
  props: PropTypes.objectOf(PropTypes.any).isRequired,
};

const getAjaxRequestSettingsHeaders = (obj) => {
  const ajaxRequestSettingsHeaders = [];
  for (const key in obj) {
    ajaxRequestSettingsHeaders.push({ headerName: key, headerValue: obj[key] });
  }
  return ajaxRequestSettingsHeaders;
};

const ajaxRequestSettings = {
  ajaxHeaders: getAjaxRequestSettingsHeaders(createRequestHeader().headers),
  withCredentials: false,
};

/**
 * All file types that can currently be opened by the Document Viewer.
 */
export const OPENABLE_DOCUMENT_TYPES = ["PDF"];

/**
 * Whether or not the document can be opened by the Document Viewer (determined by the file extension in the document name).
 */
export const isDocumentOpenable = (documentName) =>
  OPENABLE_DOCUMENT_TYPES.some((type) => documentName.toUpperCase().includes(`.${type}`));

/**
 * If possible, open the document in the Document Viewer, otherwise, download the document.
 */
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
      props: { title: documentName },
    })
  );
};

/**
 * The Document Viewer allows documents to be opened and viewed within the application.
 */
export class DocumentViewer extends Component {
  constructor() {
    super(...arguments);
    this.serviceUrl = ENVIRONMENT.filesystemProviderUrl.replace("AmazonS3Provider/", "PdfViewer");
  }

  handleOk = () => this.props.closeDocumentViewer();

  handleCancel = () => this.props.closeDocumentViewer();

  render() {
    return (
      <Modal
        title={this.props.props.title}
        visible={this.props.isDocumentViewerOpen}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={null}
        width="98%"
      >
        {/* // NOTE: See here for documentation:
        https://ej2.syncfusion.com/react/documentation/pdfviewer/getting-started/ */}
        <PdfViewerComponent
          id="pdfviewer-container"
          serviceUrl={this.serviceUrl}
          documentPath={this.props.documentPath}
          ajaxRequestSettings={ajaxRequestSettings}
          style={{ display: "block", height: "80vh" }}
          enableAnnotation={false}
        >
          {/* NOTE: Some toolbar items are hidden using CSS. */}
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
            ]}
          />
        </PdfViewerComponent>
      </Modal>
    );
  }
}

DocumentViewer.propTypes = propTypes;

const mapStateToProps = (state) => ({
  documentPath: getDocumentPath(state),
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
