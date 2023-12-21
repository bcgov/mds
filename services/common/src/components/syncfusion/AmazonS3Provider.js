import React from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { SampleBase } from "@mds/common/components/syncfusion/SampleBase";
import { ENVIRONMENT } from "@mds/common";
import {
  FileManagerComponent,
  Inject,
  NavigationPane,
  DetailsView,
  Toolbar,
  ContextMenu,
} from "@syncfusion/ej2-react-filemanager";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { openDocumentViewer } from "@mds/common/redux/actions/documentViewerActions";
import { isDocumentOpenable } from "@mds/common/components/syncfusion/DocumentViewer";
import keycloak from "@mds/common";

const propTypes = {
  path: PropTypes.string.isRequired,
};

export class AmazonS3Provider extends SampleBase {
  constructor() {
    super(...arguments);
    this.hostUrl = ENVIRONMENT.filesystemProviderUrl;
    this.pathPrefix = `mms-archive/${this.props.mineNumber}`;
  }

  toolbarClick = (args) => {
    // Prevent default download using toolbar
    if (args.item.id === `${this.filemanager.element.id}_tb_download`) {
      args.cancel = true;
      this.customDownload([]);
    }
  };

  menuClick = (args) => {
    // Prevent default download using context menu
    if (args.item.id === `${this.filemanager.element.id}_cm_download`) {
      args.cancel = true;
      this.customDownload(args.fileDetails);
    }
  };

  fileOpen = (args) => {
    if (args.fileDetails.isFile && args.fileDetails._fm_iconClass !== "e-fe-image") {
      this.customDownload([]);
    }
  };

  // Workaround method for providing authorization headers in download request: https://www.syncfusion.com/forums/144270/how-to-implement-jwt-token-send-with-every-filemanager-request
  customDownload(files) {
    const flag = this.filemanager.selectedItems.length !== 0;
    if (files.length !== 0 || flag) {
      // Create data for the controller
      const data = {
        action: "download",
        path: `${this.pathPrefix}${this.filemanager.path}`,
        names: flag ? this.filemanager.selectedItems : [""],
        data: files.length === 0 ? this.filemanager.getSelectedFiles() : files,
      };

      // If the user has selected a PDF, display it in the Document Viewer instead of downloading.
      if (
        this.filemanager.selectedItems.length === 1 &&
        isDocumentOpenable(this.filemanager.selectedItems[0])
      ) {
        const documentName = this.filemanager.selectedItems[0];
        const documentPath = data.path + documentName;
        this.props.openDocumentViewer({
          documentPath,
          props: { title: documentName },
        });
        return;
      }

      // Initiate an XHR request
      const xhr = new XMLHttpRequest();
      xhr.open("POST", this.filemanager.ajaxSettings.downloadUrl, true);
      xhr.responseType = "blob";
      xhr.onload = function () {
        if (this.status === 200) {
          let name = "";

          // Get the file name from content-disposition header
          const header = xhr.getResponseHeader("Content-Disposition");
          if (header && header.indexOf("attachment") !== -1) {
            const regex = /name[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = regex.exec(header);
            if (matches != null && matches[1]) {
              name = matches[1].replace(/['"]/g, "");
            }
          }

          // Save the file locally using anchor tag
          const blob = new Blob([this.response], { type: xhr.getResponseHeader("Content-Type") });
          const anchorUrl = window.URL.createObjectURL(blob);
          if (name) {
            const anchor = document.createElement("a");
            anchor.href = anchorUrl;
            anchor.download = name;
            anchor.click();
          } else {
            window.location = anchorUrl;
          }
          setTimeout(function () {
            URL.revokeObjectURL(anchorUrl);
          }, 100);
        }
      };

      const fdata = new FormData();
      fdata.append("downloadInput", JSON.stringify(data));
      xhr.setRequestHeader("Authorization", createRequestHeader().headers.Authorization);
      xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      xhr.send(fdata);
    }
  }

  render() {
    return (
      <div>
        <div className="control-section">
          {/* NOTE: See here for documentation: https://ej2.syncfusion.com/react/documentation/api/file-manager/ */}
          <FileManagerComponent
            id="filemanager"
            ref={(node) => {
              this.filemanager = node;
            }}
            ajaxSettings={{
              url: `${this.hostUrl}AmazonS3FileOperations`,
              getImageUrl: `${this.hostUrl}AmazonS3GetImage`,
              downloadUrl: `${this.hostUrl}AmazonS3Download`,
            }}
            allowDragAndDrop={false}
            allowMultiSelection
            enablePersistence={false}
            showFileExtension
            showHiddenItems={false}
            showThumbnail
            rootAliasName="Files"
            view="Details"
            searchSettings={{
              allowSearchOnTyping: false,
              filterType: "contains",
              ignoreCase: true,
            }}
            toolbarSettings={{
              items: ["Download", "SortBy", "Refresh", "Selection", "View", "Details"],
              visible: true,
            }}
            contextMenuSettings={{
              file: ["Open", "|", "Details"],
              folder: ["Open", "|", "Details"],
              layout: ["SortBy", "View", "Refresh", "|", "Details", "|", "SelectAll"],
              visible: true,
            }}
            beforeSend={(args) => {
              const data = JSON.parse(args.ajaxSettings.data);
              data.path = this.pathPrefix + data.path;
              args.ajaxSettings.data = JSON.stringify(data);
              args.ajaxSettings.beforeSend = function (args) {
                args.httpRequest.setRequestHeader(
                  "Authorization",
                  createRequestHeader().headers.Authorization
                );
                args.httpRequest.setRequestHeader("Access-Control-Allow-Origin", "*");
              };
            }}
            beforeDownload={(args) => {
              args.data.path = this.pathPrefix + args.data.path;
            }}
            beforeImageLoad={(args) => {
              args.imageUrl = args.imageUrl.replace(
                "/AmazonS3GetImage?path=",
                `/AmazonS3GetImage?path=${this.pathPrefix}`
              );

              args.imageUrl += `&token=${keycloak.token}`;
            }}
            menuClick={this.menuClick}
            toolbarClick={this.toolbarClick}
            fileOpen={this.fileOpen}
          >
            <Inject services={[NavigationPane, DetailsView, Toolbar, ContextMenu]} />
          </FileManagerComponent>
        </div>
      </div>
    );
  }
}

AmazonS3Provider.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openDocumentViewer,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(AmazonS3Provider);
