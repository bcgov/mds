import { map } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { FilePond, File, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

const propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  maxFileSize: PropTypes.string,
  acceptedFileTypesMap: PropTypes.object,
};

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
    };

    this.server = {
      url: ENVIRONMENT.apiUrl,
      process: {
        url: this.props.uploadUrl,
        headers: createRequestHeader()["headers"],
        onload: null,
        onerror: null,
      },
    };
  }

  render() {
    const { maxFileSize, acceptedFileTypesMap } = this.props;
    return (
      <FilePond
        server={this.server}
        name={"file"}
        allowRevert={false}
        allowMultiple={true}
        maxFileSize={maxFileSize || "100MB"}
        acceptedFileTypes={Object.keys(acceptedFileTypesMap || {})}
        fileValidateTypeLabelExpectedTypesMap={acceptedFileTypesMap}
        onupdatefiles={(fileItems) => {
          this.setState({
            files: map(fileItems, "file"),
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

FileUpload.propTypes = propTypes;

export default FileUpload;
