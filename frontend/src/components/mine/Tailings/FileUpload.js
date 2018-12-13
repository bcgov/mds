import React from "react";
import { FilePond, File } from "react-filepond";
import "filepond/dist/filepond.min.css";

// import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
// import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
// import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
// registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
    };

    this.server = {
      url: ENVIRONMENT.apiUrl,
      process: {
        url: "/document-manager",
        withCredentials: true,
        headers: createRequestHeader()["headers"],
        timeout: 7000,
        onload: null,
        onerror: null,
      },
    };
  }

  handleInit() {}

  render() {
    return (
      <FilePond
        allowMultiple={true}
        maxFiles={3}
        server={this.server}
        oninit={() => this.handleInit()}
        onupdatefiles={(fileItems) => {
            this.setState({
                files: fileItems.map(fileItem => fileItem.file)
            });
        }}
      >
        {this.state.files.map((file) => (
          <File key={file} src={file} origin="local" />
        ))}
      </FilePond>
    );
  }
}

export default FileUpload;
