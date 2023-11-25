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
  maxLength,
  dateNotInFuture,
  dateNotBeforeOther,
  dateNotAfterOther,
} from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { getExemptionFeeStatusDropDownOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  exemptionFeeStatusDropDownOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
};

const defaultProps = {
  formValues: {},
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
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="auth_end_date"
              name="auth_end_date"
              label="Authorization End Date*"
              component={renderConfig.DATE}
              validate={[required, dateNotBeforeOther(props.formValues.issue_date)]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="description"
              name="description"
              label="Description"
              component={renderConfig.FIELD}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="exemption_fee_status_code"
              name="exemption_fee_status_code"
              label="Inspection Fee Status"
              placeholder="Inspection Fee Status will be automatically populated."
              component={renderConfig.SELECT}
              disabled
              data={props.exemptionFeeStatusDropDownOptions}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="exemption_fee_status_note"
              name="exemption_fee_status_note"
              label="Fee Exemption Note"
              component={renderConfig.AUTO_SIZE_FIELD}
              validate={[maxLength(300)]}
            />
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
          disabled={props.submitting}
        >
          <Button className="full-mobile" type="secondary" disabled={props.submitting}>
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
    exemptionFeeStatusDropDownOptions: getExemptionFeeStatusDropDownOptions(state),
  })),
  reduxForm({
    form: FORM.ISSUE_PERMIT,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.ISSUE_PERMIT),
    enableReinitialize: true,
  })
)(IssuePermitForm);
