import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { remove } from "lodash";
import PropTypes from "prop-types";
import { Field, reduxForm, change, formValueSelector } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { required, dateNotInFuture, maxLength } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getDropdownPermitStatusOptions } from "@common/selectors/staticContentSelectors";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mine_guid: PropTypes.string.isRequired,
  permitTypeCode: PropTypes.string,
  permitIsExploration: PropTypes.bool,
  change: PropTypes.func,
};

const defaultProps = {
  permitTypeCode: "",
  permitIsExploration: false,
  change,
};

const permitTypes = [
  {
    label: "Coal",
    value: "C",
  },
  {
    label: "Mineral",
    value: "M",
  },
  {
    label: "Placer",
    value: "P",
  },
  {
    label: "Sand & Gravel",
    value: "G",
  },
  {
    label: "Quarry",
    value: "Q",
  },
];

const selector = formValueSelector(FORM.ADD_PERMIT);

const validateBusinessRules = (values) => {
  const errors = {};
  if (values.permit_is_exploration && !(values.permit_type === "C" || values.permit_type === "M")) {
    errors.permit_type = "Exploration is only valid for Coal and Placer permits";
  }
  return errors;
};

export class AddPermitForm extends Component {
  state = {
    uploadedFiles: [],
  };

  // File upload handlers
  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ fileName, document_manager_guid });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col md={12} sm={24} className="border--right--layout">
            <Form.Item>
              <PartySelectField
                id="permittee_party_guid"
                name="permittee_party_guid"
                label="Permittee*"
                partyLabel="permittee"
                validate={[required]}
                allowAddingParties
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="permit_type"
                name="permit_type"
                label="Permit type*"
                placeholder="Select a permit type"
                component={renderConfig.SELECT}
                validate={[required]}
                data={permitTypes}
              />
            </Form.Item>
            {(this.props.permitTypeCode === "C" ||
              this.props.permitTypeCode === "M" ||
              this.props.permitIsExploration) && (
              <Form.Item>
                <Field
                  id="permit_is_exploration"
                  name="permit_is_exploration"
                  label="Exploration permit"
                  type="checkbox"
                  component={renderConfig.CHECKBOX}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="permit_no"
                name="permit_no"
                label="Permit number*"
                component={renderConfig.FIELD}
                validate={[required, maxLength(9)]}
                inlineLabel={
                  this.props.permitTypeCode &&
                  `${this.props.permitTypeCode}${this.props.permitIsExploration ? "X" : ""} -`
                }
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="permit_status_code"
                name="permit_status_code"
                label="Permit status*"
                placeholder="Select a permit status"
                component={renderConfig.SELECT}
                data={this.props.permitStatusOptions}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Upload files">
              <Field
                id="PermitDocumentFileUpload"
                name="PermitDocumentFileUpload"
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                mineGuid={this.props.mine_guid}
                component={PermitAmendmentFileUpload}
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

AddPermitForm.propTypes = propTypes;
AddPermitForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    permitStatusOptions: getDropdownPermitStatusOptions(state),
    permitTypeCode: selector(state, "permit_type"),
    permitIsExploration: selector(state, "permit_is_exploration"),
  })),
  reduxForm({
    form: FORM.ADD_PERMIT,
    validate: validateBusinessRules,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.ADD_PERMIT),
  })
)(AddPermitForm);
