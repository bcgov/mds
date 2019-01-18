import { map } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { FilePond, File, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import tus from "tus-js-client";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

const propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  maxFileSize: PropTypes.string,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  maxFileSize: "100MB",
  acceptedFileTypesMap: {},
};

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
    };

    this.server = {
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        const upload = new tus.Upload(file, {
          endpoint: ENVIRONMENT.apiUrl + this.props.uploadUrl,
          retryDelays: [0, 1000, 3000, 5000],
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          onError: (err) => {
            error(err);
          },
          onProgress: (bytesUploaded, bytesTotal)=> {
            progress(true, bytesUploaded, bytesTotal);
          },
          onSuccess: ()=> {
            load(upload.url.split("/").pop());
          },
        });
        // Start the upload
        upload.start();
        return {
          abort: () => {
            upload.abort();
            abort();
          },
        };
      },
    };

    // this.server = {
    //   url: ENVIRONMENT.apiUrl,
    //   process: {
    //     url: this.props.uploadUrl,
    //     headers: createRequestHeader().headers,
    //     onload: null,
    //     onerror: null,
    //   },
    // };
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
