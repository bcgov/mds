import React from "react";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Button, Popconfirm, Row, Col, Alert } from "antd";
import { compose } from "redux";
import { connect } from "react-redux";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { resetForm, formatDate } from "@common/utils/helpers";
import PropTypes from "prop-types";
import {
  required,
  dateNotInFuture,
  dateNotAfterOther,
  dateNotBeforeOther,
  date,
} from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

const propTypes = {
  title: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  delayTypeOptions: CustomPropTypes.options.isRequired,
  stage: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const recordTypeCodes = {
  delay: "DEL",
  progress: "PRO",
  verification: "VER",
  decision: "DEC",
}

const validateBusinessRules = (values) => {
  // const isProcessed = values.isProcessed
  const orderedProgressStartDate =  values?.progress?.length > 0 && values.progress.sort((a, b) => b.start_date - a.start_date)
  const earliestProgressStartDate = orderedProgressStartDate[0]?.start_date
  const earliestProgressStageCode = orderedProgressStartDate[0]?.description
  const orderedDelayStartDates = values?.delays?.length > 0 && values.delays.sort((a, b) => b.start_date - a.start_date)
  const earliestDelayStartDate = orderedDelayStartDates[0]?.start_date
  // // const latestProgressEndDate = values.progress.length >0 && values.progress.sort((a, b) => b.end_date - a.end_date)
  console.log(orderedDelayStartDates)
  console.log(earliestDelayStartDate)
  // // console.log(latestProgressEndDate)
  // console.log(values)
  // console.log(isProcessed)

  const errors = {};
  console.log(values);
  if (values.recordType === recordTypeCodes.verification) {
    if ((values.verified_by_user_date > values.decision_date) && values.isProcessed) {
      errors.verified_by_user_date = `The Verification date cannot be after the decision date of ${values.decision_date}`
    } else if (values.verified_by_user_date > earliestProgressStartDate) {
      errors.verified_by_user_date = `The Verification date cannot be after the ${earliestProgressStageCode} start date of ${earliestProgressStartDate}`
    } else if (values.verified_by_user_date > earliestDelayStartDate) {
      errors.verified_by_user_date = `The Verification date cannot be after a delay start date of ${earliestDelayStartDate}`
    }
    // } else if ("the verification date cannot come after the earliest progress start date of ${}") {
    //   errors.verified_by_user_date = `The verification date cannot come after the earliest progress start date of ${values.decision_date}`
    // } else if ("the verification date cannot come after the earliest delay start date of ${}") {
    //   errors.verified_by_user_date = `The verification date cannot come after the earliest delay start date of ${values.decision_date}`
    // if ()
    // verification logic - cannot be after first progress
  } else if (values.recordType === recordTypeCodes.decision) {
    if (values.decision_by_user_date < values.verified_date) {
      errors.decision_by_user_date = `The decision date cannot pre-date the verification date of ${values.verified_date}`
    }
  }

  // else if (values.recordType === recordTypeCodes.delay) {

  // } else if (values.recordType === recordTypeCodes.progress) {
  //   // verification logic - cannot be after first progress
  // } else if (values.recordType === recordTypeCodes.decision) {
  //   // verification logic - cannot be after first progress
  //   if (values.decision_by_user_date > values.verification_date) {
  //     errors.decision_by_user_date = `The decision date cannot pre-date the verification date of ${values.verification_date}`
  //   } else if (false) {
  //     errors.decision_by_user_date = `The decision date cannot pre-date any progress or delay completion dates.`
  //   }

  // }

  if (values.start_date > values.decision_date) {
    errors.start_date = `Start date connot come after the decision date of ${values.decision_date}`;
  } else if (values.start_date < values.verified_date) {
    errors.start_date = `Start date connot pre-date the verification date of ${values.verified_date}`;
  } else if ((values.end_date > values.decision_date) && values.isProcessed) {
    errors.end_date = `End date connot come after the decision date of ${values.decision_date}`;
  } else if (values.end_date < values.start_date) {
    errors.end_date = `End date connot pre-date the the start date.`;
  } 
  return errors;
};


const UpdateNOWDateForm = (props) => {
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
        {(props.recordType !== "VER" && props.recordType !== "DEC") && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="start_date"
                  name="start_date"
                  label="Start Date*"
                  component={renderConfig.DATE}
                  validate={[
                    required,
                    dateNotInFuture,
                    // dateNotBeforeOther(props.importedDate),
                    date,
                  ]}
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

        {(props.recordType !== "VER" && props.recordType !== "DEC") && (
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
                      ? [
                          required,
                          dateNotInFuture,
                          // dateNotBeforeOther(props.formValues.start_date),
                          date,
                        ]
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
                  validate={[
                    dateNotInFuture,
                    // dateNotBeforeOther(props.formValues.start_date),
                    date,
                  ]}
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
                  validate={[
                    dateNotInFuture,
                    // dateNotBeforeOther(props.formValues.start_date),
                    date,
                  ]}
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
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
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
