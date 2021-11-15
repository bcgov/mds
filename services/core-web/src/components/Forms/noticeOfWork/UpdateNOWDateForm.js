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
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Field
                id="start_date"
                name="start_date"
                label="Start Date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture, dateNotBeforeOther(props.importedDate), date]}
              />
            </Form.Item>
          </Col>
        </Row>
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
                        dateNotBeforeOther(props.formValues.start_date),
                        date,
                      ]
                    : [dateNotInFuture, dateNotBeforeOther(props.formValues.start_date), date]
                }
              />
            </Form.Item>
          </Col>
        </Row>

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
    touchOnBlur: false,
  })
)(UpdateNOWDateForm);
