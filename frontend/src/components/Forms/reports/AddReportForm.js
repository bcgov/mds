import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { remove } from "lodash";
import PropTypes from "prop-types";
import { Field, reduxForm, change, formValueSelector } from "redux-form";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required, dateNotInFuture, maxLength } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { getDropdownPermitStatusOptions } from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  hsrcDefinedReportsDropDown: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mine_guid: PropTypes.string.isRequired,
};

const defaultProps = {};

export class AddReportForm extends Component {
  state = {
    uploadedFiles: [],
  };

  // // File upload handlers
  // onFileLoad = (fileName, document_manager_guid) => {
  //   this.state.uploadedFiles.push({ fileName, document_manager_guid });
  //   this.props.change("uploadedFiles", this.state.uploadedFiles);
  // };

  // onRemoveFile = (fileItem) => {
  //   remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
  //   this.props.change("uploadedFiles", this.state.uploadedFiles);
  // };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col md={12} sm={24} className="border--right--layout">
            <Form.Item>
              <Field
                id="report_definition_guid"
                name="report_definition_guid"
                label="Code Defined Reports"
                placeholder="Please select a report"
                data={this.props.hsrcDefinedReportsDropDown}
                doNotPinDropdown
                component={renderConfig.SELECT}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            disabled={this.props.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

AddReportForm.propTypes = propTypes;
AddReportForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    permitStatusOptions: getDropdownPermitStatusOptions(state),
  })),
  reduxForm({
    form: FORM.ADD_REPORT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_REPORT),
  })
)(AddReportForm);
