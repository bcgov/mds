import React, { FC } from "react";

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
  AjaxRequestSettingsModel,
} from "@syncfusion/ej2-react-pdfviewer";


interface PdfViewerProps {
  pdfViewerServiceUrl: string;
  documentPath: string;
  ajaxRequestSettings: AjaxRequestSettingsModel
}

const PdfViewer: FC<PdfViewerProps> = (props: PdfViewerProps) => {

  {/* // NOTE: See here for documentation:
        https://ej2.syncfusion.com/react/documentation/pdfviewer/getting-started/ */}
  return (
    <PdfViewerComponent
      id="pdfviewer-container"
      serviceUrl={props.pdfViewerServiceUrl}
      documentPath={props.documentPath}
      ajaxRequestSettings={props.ajaxRequestSettings}
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
          FormFields,
          FormDesigner,
        ]}
      />
    </PdfViewerComponent>
  );
};

export default PdfViewer;