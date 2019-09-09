import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Radio } from "antd";
import { Field } from "redux-form";
import CustomPropTypes from "@/customPropTypes";

import FileUpload from "@/components/common/FileUpload";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  existingFilesDropdown: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  onSelectExisting: PropTypes.func.isRequired,
};

class FilePicker extends Component {
  state = { uploadSelected: true };

  toggleRadioState = (value) => {
    this.setState({ uploadSelected: value.target.value });
  };

  render() {
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
            <Field id="fileUpload" name="fileUpload" component={FileUpload} {...this.props} />
          </Form.Item>
        ) : (
          <Form.Item>
            <Field
              id="attachExisting"
              name="attachExisting"
              label="Select a file that has been previously uploaded"
              component={renderConfig.SELECT}
              data={this.props.existingFilesDropdown}
              onSelect={this.props.onSelectExisting}
            />
          </Form.Item>
        )}
      </div>
    );
  }
}

FilePicker.propTypes = propTypes;

export default FilePicker;
