import React from "react";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Button, Popconfirm, Row, Col, Alert } from "antd";
import { compose } from "redux";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { resetForm, formatDate } from "@common/utils/helpers";
import PropTypes from "prop-types";
import { required, dateNotInFuture, date } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@mds/common/constants/permissions";

const propTypes = {
  title: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  showCommentFields: PropTypes.string.isRequired,
  importedDate: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  recordType: PropTypes.string.isRequired,
};

const recordTypeCodes = {
  delay: "DEL",
  progress: "PRO",
  verification: "VER",
  decision: "DEC",
};

const getSurroundingDates = (rowIndex, values) => {
  const length = values.delays.length;
  const isCurrentLast = rowIndex + 1 === length;
  const isCurrentFirst = rowIndex === 0;
  let dates = {};
  if (length > 0) {
    if (isCurrentFirst && isCurrentLast) {
      dates = {};
    } else if (isCurrentFirst) {
      dates = {
        prev_end_date: values.delays[values?.rowIndex + 1].end_date,
        next_start_date: null,
      };
    } else if (isCurrentLast) {
      dates = {
        prev_end_date: null,
        next_start_date: values.delays[values?.rowIndex - 1].start_date,
      };
    } else {
      dates = {
        prev_end_date: values.delays[values?.rowIndex + 1].end_date,
        next_start_date: values.delays[values?.rowIndex - 1].start_date,
      };
    }
  }
  return dates;
};

const getDateWithoutTime = (date) => date && date.substring(0, 10);

const validateBusinessRules = (values) => {
  const errors = {};
  if (!isEmpty(values)) {
    const orderedProgressStartDate =
      values?.progress?.length > 0 &&
      values.progress.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    const earliestProgressStartDate = orderedProgressStartDate[0]?.start_date;
    const earliestProgressStageDescription =
      values.progressCodeHash[orderedProgressStartDate[0]?.application_progress_status_code];
    const orderedDelayStartDates =
      values?.delays?.length > 0 &&
      values.delays.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    const earliestDelayStartDate =
      orderedDelayStartDates[orderedDelayStartDates.length - 1]?.start_date;
    if (values.recordType === recordTypeCodes.verification) {
      if (values.verified_by_user_date > values.decisionDate && values.isProcessed) {
        errors.verified_by_user_date = `The Verification date cannot be after the decision date of ${getDateWithoutTime(
          values.decisionDate
        )}`;
      } else if (
        getDateWithoutTime(values.verified_by_user_date) >
        getDateWithoutTime(earliestProgressStartDate)
      ) {
        errors.verified_by_user_date = `The Verification date cannot be after the ${earliestProgressStageDescription} start date of ${getDateWithoutTime(
          earliestProgressStartDate
        )}`;
      } else if (
        getDateWithoutTime(values.verified_by_user_date) >
        getDateWithoutTime(earliestDelayStartDate)
      ) {
        errors.verified_by_user_date = `The Verification date cannot be after a delay start date of ${getDateWithoutTime(
          earliestDelayStartDate
        )}`;
      }
    } else if (values.recordType === recordTypeCodes.decision) {
      if (values.decision_by_user_date < values.verifiedDate) {
        errors.decision_by_user_date = `The decision date cannot pre-date the verification date of ${getDateWithoutTime(
          values.verifiedDate
        )}`;
      }
    } else if (values.recordType === recordTypeCodes.delay) {
      const surroundingDelayDates = getSurroundingDates(values.rowIndex, values);
      if (
        surroundingDelayDates.prev_end_date &&
        values.start_date < surroundingDelayDates.prev_end_date
      ) {
        errors.start_date = `Delays cannot overlap. The start date must be after the previous delays end date of ${getDateWithoutTime(
          surroundingDelayDates.prev_end_date
        )}`;
      } else if (
        surroundingDelayDates.next_start_date &&
        values.end_date > surroundingDelayDates.next_start_date
      )
        errors.end_date = `Delays cannot overlap. The end date must be before the next delays start date of ${getDateWithoutTime(
          surroundingDelayDates.next_start_date
        )}`;
    }

    if (values.start_date > values.decisionDate && values.isProcessed) {
      errors.start_date = `Start date cannot come after the decision date of ${getDateWithoutTime(
        values.decisionDate
      )}`;
    } else if (values.start_date < values.verifiedDate) {
      errors.start_date = `Start date cannot pre-date the verification date of ${getDateWithoutTime(
        values.verifiedDate
      )}`;
    } else if (values.end_date > values.decisionDate && values.isProcessed) {
      errors.end_date = `End date cannot come after the decision date of ${getDateWithoutTime(
        values.decisionDate
      )}`;
    } else if (values.end_date < values.start_date) {
      errors.end_date = `End date cannot pre-date the the start date.`;
    }
  }
  return errors;
};

export const UpdateNOWDateForm = (props) => {
  return (
    <div>
      <Alert
        message="Rules for editing progress and delay dates"
        description={
          <>
            <div>
              <ul>
                <li>
                  Start Date cannot be before verification date: {formatDate(props.importedDate)}
                </li>
                <li>The start date must be before the end date</li>
                <li>Dates cannot be set in the future</li>
                <li>
                  If the application has been processed, dates cannot be set after the decision date
                </li>
                <li>Delay start and end dates cannot overlap with previous delays</li>
              </ul>
            </div>
          </>
        }
        type="info"
        showIcon
        closable
      />
      <br />
      <Form layout="vertical" onSubmit={props.handleSubmit}>
        {props.recordType !== "VER" && props.recordType !== "DEC" && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="start_date"
                  name="start_date"
                  label="Start Date*"
                  component={renderConfig.DATE}
                  validate={[required, dateNotInFuture, date]}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
        {props.showCommentFields && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="start_comment"
                  name="start_comment"
                  label="Start Comment"
                  component={renderConfig.AUTO_SIZE_FIELD}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {props.recordType !== "VER" && props.recordType !== "DEC" && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="end_date"
                  name="end_date"
                  label={props.initialValues.end_date ? "End Date*" : "End Date"}
                  component={renderConfig.DATE}
                  validate={
                    props.initialValues.end_date
                      ? [required, dateNotInFuture, date]
                      : [dateNotInFuture, date]
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {props.recordType === "VER" && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="verified_by_user_date"
                  name="verified_by_user_date"
                  label="Verification/Import Date"
                  component={renderConfig.DATE}
                  validate={[dateNotInFuture, required, date]}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {props.recordType === "DEC" && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="decision_by_user_date"
                  name="decision_by_user_date"
                  label="Decision Date"
                  component={renderConfig.DATE}
                  validate={[dateNotInFuture, required, date]}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {props.showCommentFields && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="end_comment"
                  name="end_comment"
                  label="End Comment"
                  component={renderConfig.AUTO_SIZE_FIELD}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
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
          <AuthorizationWrapper permission={Permission.EDIT_NOW_DATES}>
            <Button htmlType="submit" type="primary">
              Update
            </Button>
          </AuthorizationWrapper>
        </div>
      </Form>
    </div>
  );
};

UpdateNOWDateForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.UPDATE_PROGRESS_DATE_FORM)(state) || {},
  })),
  reduxForm({
    form: FORM.UPDATE_PROGRESS_DATE_FORM,
    onSubmitSuccess: resetForm(FORM.UPDATE_PROGRESS_DATE_FORM),
    validate: validateBusinessRules,
    touchOnBlur: false,
  })
)(UpdateNOWDateForm);
