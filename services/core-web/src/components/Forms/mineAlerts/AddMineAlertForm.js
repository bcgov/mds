import React from "react";
import PropTypes from "prop-types";
import { Field, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Col, Row, Typography } from "antd";
import {
  required,
  dateNotBeforeOther,
  dateNotAfterOther,
  maxLength,
  phoneNumber,
  alertStartDateNotBeforeHistoric,
  alertNotInFutureIfCurrentActive,
} from "@mds/common/redux/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
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
      <FormWrapper
        name={FORM.ADD_EDIT_MINE_ALERT}
        isModal
        reduxFormConfig={{
          touchOnBlur: false,
          enableReinitialize: true,
        }}
        onSubmit={props.onSubmit}
        initialValues={props.initialValues}>
        <Typography.Paragraph>
          <Typography.Text>{text}</Typography.Text>
        </Typography.Paragraph>
        <Typography.Paragraph>
          Anything written in internal staff alerts may be requested under FOIPPA. Keep it
          professional and concise.
        </Typography.Paragraph>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Field
              id="contact_name"
              name="contact_name"
              label="Contact Name"
              component={renderConfig.FIELD}
              required
              validate={[required, maxLength(200)]}
            />
          </Col>
          <Col md={12} xs={24}>
            <Field
              id="contact_phone"
              name="contact_phone"
              label="Contact Number"
              component={renderConfig.FIELD}
              required
              validate={[required, phoneNumber, maxLength(12)]}
              normalize={normalizePhone}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Field
              id="message"
              name="message"
              label="Message"
              component={renderConfig.AUTO_SIZE_FIELD}
              required
              validate={[required, maxLength(300)]}
              maximumCharacters={300}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Field
              id="start_date"
              name="start_date"
              label="Start Date"
              placeholder="Select Date"
              component={renderConfig.DATE}
              required
              validate={startDateValidation()}
              format={null}
            />
          </Col>
          <Col span={12}>
            <Field
              id="end_date"
              name="end_date"
              label="Expiry Date"
              placeholder="Select Date"
              component={renderConfig.DATE}
              validate={[dateNotBeforeOther(props.formValues.start_date)]}
              format={null}
            />
          </Col>
        </Row>
        <div className="right center-mobile">
          <RenderCancelButton />
          <RenderSubmitButton buttonText={title} />
        </div>
      </FormWrapper>
    </div>
  );
};

AddMineAlertForm.propTypes = propTypes;
AddMineAlertForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.ADD_EDIT_MINE_ALERT)(state) || {},
  }))
)(AddMineAlertForm);
