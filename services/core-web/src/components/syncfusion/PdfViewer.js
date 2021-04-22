import React, { Component } from "react";
import PropTypes from "prop-types";
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
  documentPath: PropTypes.string,
  serviceUrl: PropTypes.string.isRequired,
};

const defaultProps = {
  documentPath: null,
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
  render() {
    return (
      <PdfViewerComponent
        id="pdfviewer-container"
        documentPath={this.props.documentPath}
        serviceUrl={this.props.serviceUrl}
        ajaxRequestSettings={ajaxRequestSettings}
        style={{ height: 640 }}
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
