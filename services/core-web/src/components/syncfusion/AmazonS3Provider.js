import React from "react";
import PropTypes from "prop-types";
import { SampleBase } from "@/components/syncfusion/SampleBase";
import { ENVIRONMENT } from "@common/constants/environment";
import {
  FileManagerComponent,
  Inject,
  NavigationPane,
  DetailsView,
  Toolbar,
  ContextMenu,
} from "@syncfusion/ej2-react-filemanager";
import { createRequestHeader } from "@common/utils/RequestHeaders";

const propTypes = {
  path: PropTypes.string.isRequired,
};

export class AmazonS3Provider extends SampleBase {
  constructor() {
    super(...arguments);
    this.hostUrl = ENVIRONMENT.syncfusionFilesystemProviderUrl;
  }

  render() {
    const pathPrefix = `/${this.props.mineNumber}`;
    return (
      <div>
        <div className="control-section">
          {/* NOTE: See here for documentation: https://ej2.syncfusion.com/react/documentation/api/file-manager/ */}
          <FileManagerComponent
            id="filemanager"
            ajaxSettings={{
              url: `${this.hostUrl}AmazonS3FileOperations`,
              getImageUrl: `${this.hostUrl}AmazonS3GetImage`,
              downloadUrl: `${this.hostUrl}AmazonS3Download`,
            }}
            allowDragAndDrop={false}
            rootAliasName={null}
            view="LargeIcons"
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
            searchSettings={{ allowSearchOnTyping: false }}
            beforeSend={(args) => {
              const data = JSON.parse(args.ajaxSettings.data);
              data.path = pathPrefix + data.path;
              args.ajaxSettings.data = JSON.stringify(data);
              args.ajaxSettings.beforeSend = function(args) {
                args.httpRequest.setRequestHeader(
                  "Authorization",
                  createRequestHeader().headers.Authorization
                );
                args.httpRequest.setRequestHeader("Access-Control-Allow-Origin", "*");
              };
            }}
            beforeDownload={(args) => {
              args.data.path = pathPrefix + args.data.path;
            }}
            beforeImageLoad={(args) => {
              args.imageUrl = args.imageUrl.replace(
                "/AmazonS3GetImage?path=",
                `/AmazonS3GetImage?path=${pathPrefix}`
              );
            }}
          >
            <Inject services={[NavigationPane, DetailsView, Toolbar, ContextMenu]} />
          </FileManagerComponent>
        </div>
      </div>
    );
  }
}

AmazonS3Provider.propTypes = propTypes;

export default AmazonS3Provider;
