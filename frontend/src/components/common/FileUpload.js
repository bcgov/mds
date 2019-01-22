import { map } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { FilePond, File, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

const propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  maxFileSize: PropTypes.string,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string),
  onFileLoad: PropTypes.func,
};

const defaultProps = {
  maxFileSize: "100MB",
  acceptedFileTypesMap: {},
  onFileLoad: null
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
        headers: createRequestHeader().headers,
        onload: this.props.onFileLoad,
        onerror: null,
      },
    };
  }

  render() {
    const acceptedFileTypes = Object.keys(this.props.acceptedFileTypesMap);

    return (
      <FilePond
        server={this.server}
        name="file"
        allowRevert={false}
        allowMultiple
        maxFileSize={this.props.maxFileSize}
        allowFileTypeValidation={acceptedFileTypes.length > 0}
        acceptedFileTypes={acceptedFileTypes}
        fileValidateTypeLabelExpectedTypesMap={this.props.acceptedFileTypesMap}
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
FileUpload.defaultProps = defaultProps;

export default FileUpload;
