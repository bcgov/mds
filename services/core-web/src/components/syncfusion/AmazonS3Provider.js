import React from "react";
import { SampleBase } from "@/components/syncfusion/SampleBase";
import {
  FileManagerComponent,
  Inject,
  NavigationPane,
  DetailsView,
  Toolbar,
  ContextMenu,
} from "@syncfusion/ej2-react-filemanager";

export class AmazonS3Provider extends SampleBase {
  constructor() {
    super(...arguments);
    // this.hostUrl = "https://amazons3.azurewebsites.net/api/AmazonS3Provider/";
    // TODO: Figure out and use an ENV variable for this.
    this.hostUrl = "http://localhost:62870/api/AmazonS3Provider/";
  }

  render() {
    return (
      <div>
        <div className="control-section">
          {/* NOTE: See here for more information: https://ej2.syncfusion.com/react/documentation/api/file-manager/ */}
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
            // path="/foobar"
            searchSettings={{ allowSearchOnTyping: false }}
          >
            {/* TODO: Figure out the minimal services required to view files. */}
            <Inject services={[NavigationPane, DetailsView, Toolbar, ContextMenu]} />
          </FileManagerComponent>
        </div>
      </div>
    );
  }
}

export default AmazonS3Provider;
