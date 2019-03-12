import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, formValueSelector } from "redux-form";
import RenderField from "@/components/common/RenderField";
import RenderSelect from "@/components/common/RenderSelect";
import RenderDate from "@/components/common/RenderDate";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required, dateNotInFuture } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { getDropdownPermitStatusOptions } from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  permitTypeCode: PropTypes.string,
  permitActivityTypeCode: PropTypes.string,
  mine_guid: PropTypes.string.isRequired,
};

const defaultProps = {
  permitTypeCode: "",
  permitActivityTypeCode: "",
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

const permitActivityTypes = [
  {
    label: "Operation",
    value: "",
  },
  {
    label: "Exploration",
    value: "X",
  },
];

const selector = formValueSelector(FORM.ADD_PERMIT);

const validateBusinessRules = (values) => {
  const errors = {};
  if (
    values.permit_activity_type === "X" &&
    !(values.permit_type === "C" || values.permit_type === "M")
  ) {
    errors.permit_activity_type = "Exploration activity is only valid for Coal and Placer permits";
  }
  return errors;
};

class AddPermitForm extends Component {
  onFileLoad = (fileName, document_manager_guid) => {
    this.props.initialValues.uploadedFiles.push({ fileName, document_manager_guid });
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col md={12} sm={24} className="border--right--layout">
            <Form.Item>
              <Field
                id="permit_type"
                name="permit_type"
                label="Permit type*"
                placeholder="Select a permit type"
                component={RenderSelect}
                validate={[required]}
                data={permitTypes}
              />
            </Form.Item>
            {(this.props.permitTypeCode === "C" ||
              this.props.permitTypeCode === "M" ||
              this.props.permitActivityTypeCode === "X") && (
              <Form.Item>
                <Field
                  id="permit activity type*"
                  name="permit_activity_type"
                  label="Permit activity type*"
                  placeholder="Select a permit activity type"
                  component={RenderSelect}
                  data={permitActivityTypes}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="permit_no"
                name="permit_no"
                label="Permit number*"
                component={RenderField}
                validate={[required]}
                inlineLabel={
                  this.props.permitTypeCode &&
                  `${this.props.permitTypeCode}${this.props.permitActivityTypeCode} -`
                }
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="permit_status_code"
                name="permit_status_code"
                label="Permit status*"
                placeholder="Select a permit status"
                component={RenderSelect}
                data={this.props.permitStatusOptions}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue date*"
                component={RenderDate}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Upload/Attach Documents">
              <Field
                id="PermitDocumentFileUpload"
                name="PermitDocumentFileUpload"
                onFileLoad={this.onFileLoad}
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
    permitActivityTypeCode: selector(state, "permit_activity_type"),
  })),
  reduxForm({
    form: FORM.ADD_PERMIT,
    validateBusinessRules,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_PERMIT),
  })
)(AddPermitForm);
