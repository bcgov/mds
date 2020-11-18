/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import "filepond-polyfill";
import { FilePond, registerPlugin } from "react-filepond";
import { Switch } from "antd";
import { invertBy, invert, uniq, isLength } from "lodash";
import { FunnelPlotOutlined } from "@ant-design/icons";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import tus from "tus-js-client";
import { ENVIRONMENT } from "@common/constants/environment";
import { createRequestHeader } from "@common/utils/RequestHeaders";
import { FLUSH_SOUND, WATER_SOUND } from "@/constants/assets";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

const propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  maxFileSize: PropTypes.string,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string),
  onFileLoad: PropTypes.func,
  onRemoveFile: PropTypes.func,
  chunkSize: PropTypes.number,
  allowRevert: PropTypes.bool,
  allowMultiple: PropTypes.bool,
  addFileStart: PropTypes.func,
};

const defaultProps = {
  maxFileSize: "750MB",
  acceptedFileTypesMap: {},
  onFileLoad: () => {},
  onRemoveFile: () => {},
  addFileStart: () => {},
  chunkSize: 1048576, // 1MB
  allowRevert: false,
  allowMultiple: true,
};

class FileUpload extends React.Component {
  state = { showWhirlpool: false };

  constructor(props) {
    super(props);

    this.server = {
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        console.log("file", file);
        console.log("metadata", metadata);
        const upload = new tus.Upload(file, {
          endpoint: ENVIRONMENT.apiUrl + this.props.uploadUrl,
          retryDelays: [100, 1000, 3000],
          removeFingerprintOnSuccess: true,
          chunkSize: this.props.chunkSize,
          metadata: {
            filename: file.name,
            filetype: file.type || "application/octet-stream",
          },
          headers: createRequestHeader().headers,

          onError: (err) => {
            console.log("err", err);
            error(err);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            progress(true, bytesUploaded, bytesTotal);
          },
          onSuccess: () => {
            const documentGuid = upload.url.split("/").pop();
            load(documentGuid);
            this.props.onFileLoad(file.name, documentGuid);
            if (this.state.showWhirlpool) {
              this.flushSound.play();
            }
          },
        });
        upload.start();
        return {
          abort: () => {
            upload.abort();
            abort();
          },
        };
      },
    };
  }

  componentWillUnmount() {
    if (this.flushSound) {
      this.flushSound.removeEventListener("ended", () => this.setState({ play: false }));
    }
  }

  render() {
    let fileValidateTypeLabelExpectedTypesMap = {};
    let i = 0;
    for (const ext in this.props.acceptedFileTypesMap) {
      let mimeType = this.props.acceptedFileTypesMap[ext];
      if (mimeType in fileValidateTypeLabelExpectedTypesMap) {
        mimeType += `/${i}`;
      }
      fileValidateTypeLabelExpectedTypesMap[mimeType] = ext;
      i++;
    }
    fileValidateTypeLabelExpectedTypesMap = fileValidateTypeLabelExpectedTypesMap;
    console.log("fileValidateTypeLabelExpectedTypesMap", fileValidateTypeLabelExpectedTypesMap);

    const acceptedFileTypes = Object.keys(fileValidateTypeLabelExpectedTypesMap);
    console.log("acceptedFileTypes", acceptedFileTypes);

    return (
      <div
        className={
          this.state.showWhirlpool ? "whirlpool-container whirlpool-on" : "whirlpool-container"
        }
      >
        <Switch
          className="ant-switch-overlay"
          checkedChildren={<FunnelPlotOutlined />}
          unCheckedChildren={<FunnelPlotOutlined />}
          checked={this.state.showWhirlpool}
          onChange={() => {
            if (!this.waterSound) {
              this.waterSound = new Audio(WATER_SOUND);
              this.flushSound = new Audio(FLUSH_SOUND);
            }
            this.setState((prevState) => ({ showWhirlpool: !prevState.showWhirlpool }));
            if (!this.state.showWhirlpool) {
              this.waterSound.play();
            } else {
              this.waterSound.pause();
            }
          }}
        />
        <FilePond
          server={this.server}
          name="file"
          allowRevert={this.props.allowRevert}
          onremovefile={this.props.onRemoveFile}
          allowMultiple={this.props.allowMultiple}
          onaddfilestart={this.props.addFileStart}
          maxFileSize={this.props.maxFileSize}
          allowFileTypeValidation={acceptedFileTypes.length > 0}
          acceptedFileTypes={acceptedFileTypes}
          fileValidateTypeLabelExpectedTypesMap={{}}
          fileValidateTypeDetectType={(source, type) =>
            new Promise((resolve, reject) => {
              console.log("source", source);
              console.log("type", type);
              if (!type) {
                const exts = source.name.split(".");
                const ext = exts && `.${exts.pop()}`;
                if (ext in this.props.acceptedFileTypesMap) {
                  type = this.props.acceptedFileTypesMap[ext];
                } else {
                  reject(type);
                }
              }
              console.log("source", source);
              console.log("new type", type);
              resolve(type);
            })
          }
        />
      </div>
    );
  }
}

FileUpload.propTypes = propTypes;
FileUpload.defaultProps = defaultProps;

export default FileUpload;
