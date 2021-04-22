import React, { Component } from "react";
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

const propTypes = {
  serviceUrl: PropTypes.string,
  documentPath: PropTypes.string,
  height: PropTypes.string,
};

const defaultProps = {
  serviceUrl: null,
  documentPath: null,
  height: "640px",
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

export class PdfViewer extends Component {
  constructor() {
    super(...arguments);
    this.serviceUrl =
      this.props.serviceUrl ??
      ENVIRONMENT.filesystemProviderUrl.replace("AmazonS3Provider/", "PdfViewer");
  }

  render() {
    return (
      // NOTE: See here for documentation: https://ej2.syncfusion.com/react/documentation/pdfviewer/getting-started/
      <PdfViewerComponent
        ref={(node) => {
          this.pdfViewerComponent = node;
        }}
        id="pdfviewer-container"
        serviceUrl={this.serviceUrl}
        documentPath={this.props.documentPath}
        ajaxRequestSettings={ajaxRequestSettings}
        style={{ display: "block", height: this.props.height }}
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
    );
  }
}

PdfViewer.propTypes = propTypes;
PdfViewer.defaultProps = defaultProps;

export default PdfViewer;
