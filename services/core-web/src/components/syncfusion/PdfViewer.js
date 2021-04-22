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
  documentPath: "",
};

export class PdfViewer extends Component {
  constructor() {
    super(...arguments);
  }

  //   componentWillReceiveProps(nextProps) {
  //     if (nextProps !== this.props) {
  //       console.log(nextProps);
  //       console.log(this.pdfviewer);
  //     }
  //   }

  getAjaxRequestSettingsHeaders = (obj) => {
    const ajaxRequestSettingsHeaders = [];
    for (const key in obj) {
      ajaxRequestSettingsHeaders.push({ headerName: key, headerValue: obj[key] });
    }
    return ajaxRequestSettingsHeaders;
  };

  render() {
    const ajaxRequestSettings = {
      ajaxHeaders: [
        ...this.getAjaxRequestSettingsHeaders(createRequestHeader().headers),
        // { headerName: "Host", headerValue: "localhost:62870" },
        // { headerName: "Origin", headerValue: "http://localhost:3000" },
        // { headerName: "Referer", headerValue: "http://localhost:3000/" },
      ],
      withCredentials: true,
    };

    console.log(ajaxRequestSettings);
    return (
      <PdfViewerComponent
        id="pdfviewer-container"
        ref={(node) => {
          this.pdfviewer = node;
        }}
        documentPath={this.props.documentPath}
        serviceUrl={this.props.serviceUrl}
        // serverActionSettings={{ load: "" }}
        ajaxRequestSettings={ajaxRequestSettings}
        style={{ height: "640px" }}
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
