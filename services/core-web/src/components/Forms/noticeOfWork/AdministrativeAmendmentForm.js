import React from "react";
import PropTypes from "prop-types";
import { Field, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Col, Row } from "antd";
import { required, dateNotInFuture } from "@mds/common/redux/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { createDropDownList, formatDate } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import {
  getApplicationReasonCodeDropdownOptions,
  getApplicationSourceTypeCodeDropdownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
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
    <FormWrapper
      name={FORM.ADMINISTRATIVE_AMENDMENT_FORM}
      isModal
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
      onSubmit={props.onSubmit}>
      <Row>
        <Col span={24}>
          <Field
            id="permit_id"
            name="permit_id"
            placeholder="Select a Permit"
            label="Permit"
            component={renderConfig.SELECT}
            data={permitDropdown}
            required
            validate={[required]}
          />
          {props.formValues.permit_id && (
            <Field
              id="permit_amendment_guid"
              name="permit_amendment_guid"
              label="Source Amendment by Issue Date"
              component={renderConfig.SELECT}
              data={amendmentDropdown}
              required
              validate={[required]}
            />
          )}
          <Field
            id="application_source_type_code"
            name="application_source_type_code"
            label="Source of Amendment"
            component={renderConfig.SELECT}
            data={props.applicationSourceTypeCodeOptions}
            required
            validate={[required]}
          />
          <Field
            id="application_reason_codes"
            name="application_reason_codes"
            label="Reason for Amendment"
            component={renderConfig.MULTI_SELECT}
            data={props.applicationReasonCodeOptions}
            required
            validate={[required]}
          />
          <Field
            id="received_date"
            name="received_date"
            label="Received Date"
            component={renderConfig.DATE}
            required
            validate={[required, dateNotInFuture]}
          />
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText="Proceed" disableOnClean={false} />
      </div>
    </FormWrapper>
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
  }))
)(AdministrativeAmendmentForm);
