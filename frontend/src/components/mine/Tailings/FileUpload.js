import React from "react";
import { FilePond, File, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
registerPlugin(FilePondPluginFileValidateSize);

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
        url: `/documents/expected/${this.props.expDocumentGuid}/document`,
        headers: createRequestHeader()["headers"],
        onload: null,
        onerror: null,
      },
    };
  }

  render() {
    return (
      <FilePond
        name={"file"}
        allowRevert={false}
        allowMultiple={true}
        maxFileSize={"100MB"}
        server={this.server}
        onupdatefiles={(fileItems) => {
          this.setState({
            files: fileItems.map((fileItem) => fileItem.file),
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
