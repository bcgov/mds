import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Radio } from "antd";
import { Field } from "redux-form";

import FileUpload from "@/components/common/FileUpload";
import { renderConfig } from "@/components/common/config";
import { createDropDownList } from "@/utils/helpers";

const propTypes = {
  maxFileSize: PropTypes.string,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string),
  uploadUrl: PropTypes.string.isRequired,
  existingFiles: PropTypes.arrayOf(
    PropTypes.shape({
      mine_document_guid: PropTypes.string,
      document_name: PropTypes.string,
    })
  ).isRequired,
  onSelectExisting: PropTypes.func.isRequired,
};

const defaultProps = {
  maxFileSize: undefined,
  acceptedFileTypesMap: undefined,
};

class FilePicker extends Component {
  state = { uploadSelected: true };

  toggleRadioState = (value) => {
    this.setState({ uploadSelected: value.target.value });
  };

  render() {
    const fileDropdown = createDropDownList(
      this.props.existingFiles,
      "document_name",
      "mine_document_guid"
    );

    return (
      <div>
        <div className="center">
          <Form.Item>
            <Radio.Group defaultValue size="large" onChange={this.toggleRadioState}>
              <Radio.Button value>Upload new file(s)</Radio.Button>
              <Radio.Button value={false}>Attach existing file(s)</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>
        {this.state.uploadSelected ? (
          <Form.Item>
            <Field
              id="fileUpload"
              name="fileUpload"
              uploadUrl={this.props.uploadUrl}
              maxFileSize={this.props.maxFileSize}
              acceptedFileTypesMap={this.props.acceptedFileTypesMap}
              component={FileUpload}
            />
          </Form.Item>
        ) : (
          <Form.Item>
            <Field
              id="attachExisting"
              name="attachExisting"
              label="Select a file that has been previously uploaded"
              component={renderConfig.SELECT}
              data={fileDropdown}
              onSelect={this.props.onSelectExisting}
            />
          </Form.Item>
        )}
      </div>
    );
  }
}

FilePicker.propTypes = propTypes;
FilePicker.defaultProps = defaultProps;

export default FilePicker;
