import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Form } from "@ant-design/compatible";
import { Button, Col, Row, Popconfirm, Typography } from "antd";
import {
  required,
  dateNotBeforeOther,
  dateNotAfterOther,
  maxLength,
  phoneNumber,
  alertStartDateNotBeforeHistoric,
  alertNotInFutureIfCurrentActive,
} from "@common/utils/Validate";
import { resetForm, normalizePhone } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  activeMineAlert: CustomPropTypes.mineAlert,
  mineAlerts: PropTypes.arrayOf(CustomPropTypes.mineAlert),
};

const defaultProps = {
  formValues: {},
  activeMineAlert: {},
  mineAlerts: [],
};

export const AddMineAlertForm = (props) => {
  const { title, text, activeMineAlert, mineAlerts, formValues } = props;

  const startDateValidation = () => {
    return formValues?.mine_alert_guid
      ? [
          required,
          dateNotAfterOther(props.formValues.stop_date),
          alertStartDateNotBeforeHistoric(mineAlerts),
        ]
      : [
          required,
          dateNotAfterOther(props.formValues.stop_date),
          alertStartDateNotBeforeHistoric(mineAlerts),
          dateNotBeforeOther(activeMineAlert.start_date),
          alertNotInFutureIfCurrentActive(activeMineAlert),
        ];
  };

  return (
    <div>
      <Form layout="vertical" onSubmit={props.handleSubmit}>
        <Typography.Paragraph>
          <Typography.Text>{text}</Typography.Text>
        </Typography.Paragraph>
        <Typography.Paragraph>
          Anything written in internal staff alerts may be requested under FOIPPA. Keep it
          professional and concise.
        </Typography.Paragraph>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="contact_name"
                name="contact_name"
                label="Contact Name"
                component={renderConfig.FIELD}
                validate={[required, maxLength(200)]}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="contact_phone"
                name="contact_phone"
                label="Contact Number"
                component={renderConfig.FIELD}
                validate={[required, phoneNumber, maxLength(12)]}
                normalize={normalizePhone}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Field
                id="message"
                name="message"
                label="Message"
                component={renderConfig.AUTO_SIZE_FIELD}
                validate={[required, maxLength(300)]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <Field
                id="start_date"
                name="start_date"
                label="Start Date"
                placeholder="Select Date"
                component={renderConfig.DATE}
                validate={startDateValidation()}
                format={null}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Field
                id="end_date"
                name="end_date"
                label="Expiry Date (optional)"
                placeholder="Select Date"
                component={renderConfig.DATE}
                validate={[dateNotBeforeOther(props.formValues.start_date)]}
                format={null}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right center-mobile">
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={props.submitting}
          >
            {title}
          </Button>
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={props.closeModal}
            okText="Yes"
            cancelText="No"
            disabled={props.submitting}
          >
            <Button className="full-mobile" type="secondary" disabled={props.submitting}>
              Cancel
            </Button>
          </Popconfirm>
        </div>
      </Form>
    </div>
  );
};

AddMineAlertForm.propTypes = propTypes;
AddMineAlertForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.ADD_EDIT_MINE_ALERT)(state) || {},
  })),
  reduxForm({
    form: FORM.ADD_EDIT_MINE_ALERT,
    onSubmitSuccess: resetForm(FORM.ADD_EDIT_MINE_ALERT),
    touchOnBlur: false,
    enableReinitialize: true,
  })
)(AddMineAlertForm);
