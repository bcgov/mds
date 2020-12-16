import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import {
  required,
  dateNotInFuture,
  dateNotBeforeOther,
  dateNotAfterOther,
} from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { resetForm, isPlacerAdjustmentFeeValid } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  formValues: {},
};

const dateRangeIsValidStart = (value, allValues, props) => {
  const start = value;
  const end = allValues.auth_end_date;
  return dateRangeIsValid(start, end, props);
};

const dateRangeIsValidEnd = (value, allValues, props) => {
  const start = allValues.issue_date;
  const end = value;
  return dateRangeIsValid(start, end, props);
};

const dateRangeIsValid = (start, end, props) => {
  const type = props.noticeOfWork.notice_of_work_type_code;
  const proposedTonnage = props.noticeOfWork.proposed_annual_maximum_tonnage;
  const adjustedTonnage = props.noticeOfWork.adjusted_annual_maximum_tonnage;

  if (type === "PLA") {
    return isPlacerAdjustmentFeeValid(proposedTonnage, adjustedTonnage, start, end)
      ? undefined
      : "This value would create an invalid date range for the paid permit fee.";
  }

  return undefined;
};

export const IssuePermitForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row>
        <Col span={24}>
          <Form.Item>
            <Field
              id="issue_date"
              name="issue_date"
              label="Issue Date*"
              component={renderConfig.DATE}
              validate={[
                required,
                dateNotInFuture,
                dateNotAfterOther(props.formValues.auth_end_date),
                dateRangeIsValidStart,
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="auth_end_date"
              name="auth_end_date"
              label="Authorization End Date*"
              component={renderConfig.DATE}
              validate={[
                required,
                dateNotBeforeOther(props.formValues.issue_date),
                dateRangeIsValidEnd,
              ]}
            />
            <Form.Item>
              <Field
                id="description"
                name="description"
                label="Description"
                component={renderConfig.FIELD}
              />
            </Form.Item>
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile" type="secondary">
            Cancel
          </Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
          {props.title}
        </Button>
      </div>
    </Form>
  );
};

IssuePermitForm.propTypes = propTypes;
IssuePermitForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.ISSUE_PERMIT)(state),
  })),
  reduxForm({
    form: FORM.ISSUE_PERMIT,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.ISSUE_PERMIT),
    enableReinitialize: true,
  })
)(IssuePermitForm);
