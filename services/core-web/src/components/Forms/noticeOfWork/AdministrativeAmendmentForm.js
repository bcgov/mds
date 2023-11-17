import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, dateNotInFuture } from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { resetForm, createDropDownList, formatDate } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import {
  getApplicationReasonCodeDropdownOptions,
  getApplicationSourceTypeCodeDropdownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  applicationReasonCodeOptions: CustomPropTypes.options.isRequired,
  applicationSourceTypeCodeOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  formValues: {},
};

export const AdministrativeAmendmentForm = (props) => {
  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_id");
  const permitAmendments = props.permits.filter(
    ({ permit_id }) => permit_id === props.formValues.permit_id
  )[0];

  const amendmentDropdown = props.formValues.permit_id
    ? createDropDownList(
        permitAmendments.permit_amendments.filter(
          ({ permit_amendment_status_code }) => permit_amendment_status_code !== "DFT"
        ),
        "issue_date",
        "permit_amendment_guid",
        false,
        null,
        formatDate
      )
    : [];

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row>
        <Col span={24}>
          <Form.Item>
            <Field
              id="permit_id"
              name="permit_id"
              placeholder="Select a Permit"
              label="Permit*"
              component={renderConfig.SELECT}
              data={permitDropdown}
              validate={[required]}
            />
          </Form.Item>
          {props.formValues.permit_id && (
            <Form.Item>
              <Field
                id="permit_amendment_guid"
                name="permit_amendment_guid"
                label="Source Amendment by Issue Date*"
                component={renderConfig.SELECT}
                data={amendmentDropdown}
                validate={[required]}
              />
            </Form.Item>
          )}
          <Form.Item>
            <Field
              id="application_source_type_code"
              name="application_source_type_code"
              label="Source of Amendment*"
              component={renderConfig.SELECT}
              data={props.applicationSourceTypeCodeOptions}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="application_reason_codes"
              name="application_reason_codes"
              label="Reason for Amendment*"
              component={renderConfig.MULTI_SELECT}
              data={props.applicationReasonCodeOptions}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="received_date"
              name="received_date"
              label="Received Date*"
              component={renderConfig.DATE}
              validate={[required, dateNotInFuture]}
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
          Proceed
        </Button>
      </div>
    </Form>
  );
};

AdministrativeAmendmentForm.propTypes = propTypes;
AdministrativeAmendmentForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.ADMINISTRATIVE_AMENDMENT_FORM)(state),
    permits: getPermits(state),
    applicationReasonCodeOptions: getApplicationReasonCodeDropdownOptions(state),
    applicationSourceTypeCodeOptions: getApplicationSourceTypeCodeDropdownOptions(state),
  })),
  reduxForm({
    form: FORM.ADMINISTRATIVE_AMENDMENT_FORM,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.ADMINISTRATIVE_AMENDMENT_FORM),
    enableReinitialize: true,
  })
)(AdministrativeAmendmentForm);
