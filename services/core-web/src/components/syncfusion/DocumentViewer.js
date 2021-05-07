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
import {
  closeDocumentViewer,
  changeDocumentViewerTitle,
} from "@common/actions/documentViewerActions";
import {
  getDocumentPath,
  getIsDocumentViewerOpen,
  getProps,
} from "@common/selectors/documentViewerSelectors";

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

export class DocumentViewer extends Component {
  constructor() {
    super(...arguments);
    this.serviceUrl =
      this.props.serviceUrl ??
      ENVIRONMENT.filesystemProviderUrl.replace("AmazonS3Provider/", "PdfViewer");
  }

  unloadDocument = () => this.pdfViewerComponent.unload();

  handleOk = () => this.props.closeDocumentViewer();

  handleCancel = () => this.props.closeDocumentViewer();

  documentLoad = (args) => this.props.changeDocumentViewerTitle(args.documentName);

  render() {
    return (
      <Modal
        title={this.props.props.title}
        visible={this.props.isDocumentViewerOpen}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={null}
        width={"98%"}
      >
        {/* // NOTE: See here for documentation:
        https://ej2.syncfusion.com/react/documentation/pdfviewer/getting-started/ */}
        <PdfViewerComponent
          ref={(node) => {
            this.pdfViewerComponent = node;
          }}
          id="pdfviewer-container"
          serviceUrl={this.serviceUrl}
          documentPath={this.props.documentPath}
          ajaxRequestSettings={ajaxRequestSettings}
          style={{ display: "block", height: "80vh" }}
          enableAnnotation={false}
          documentLoad={(args) => this.documentLoad(args)}
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
      changeDocumentViewerTitle,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentViewer);
