import React, { useState, useEffect } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Field, getFormValues, change } from "redux-form";
import { Col, Row, Tooltip, Alert } from "antd";
import { createDropDownList } from "@common/utils/helpers";
import {
  required,
  requiredRadioButton,
  validateIfApplicationTypeCorrespondsToPermitNumber,
} from "@mds/common/redux/utils/Validate";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import { getNoticeOfWorkEditableTypes } from "@mds/common/redux/selectors/noticeOfWorkSelectors";

import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import {
  getDropdownPermitAmendmentTypeOptions,
  getDropdownNoticeOfWorkApplicationTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { PERMIT_AMENDMENT_TYPES } from "@mds/common/constants/strings";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  isCoalOrMineral: PropTypes.bool.isRequired,
  permitAmendmentTypeDropDownOptions: CustomPropTypes.options.isRequired,
  change: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
  formValues: PropTypes.objectOf(PropTypes.string).isRequired,
  isNoticeOfWorkTypeDisabled: PropTypes.bool.isRequired,
  applicationTypeOptions: CustomPropTypes.options.isRequired,
  editableApplicationTypeOptions: CustomPropTypes.options.isRequired,
};

// TODO the validate option on form fields are not working on this form, they are being called but they are not showing the validation errors and not blocking the submit,
// the reason is in not linked submit function and the structure of draft permit modal in general

export const PreDraftPermitForm = (props) => {
  const [permitType, setPermitType] = useState(
    props.initialValues.disabled
      ? PERMIT_AMENDMENT_TYPES.amendment
      : PERMIT_AMENDMENT_TYPES.original
  );
  const [isAmendment, setIsAmendment] = useState(
    props.initialValues?.type_of_application !== "New Permit"
  );

  const [applicationTypeToPermitMismatch, setApplicationTypeToPermitMismatch] = useState(
    validateIfApplicationTypeCorrespondsToPermitNumber(
      props.initialValues?.notice_of_work_type_code,
      props.permits.find((p) => p.permit_guid === props.formValues?.permit_guid)
    )
  );
  const formName = FORM.PRE_DRAFT_PERMIT;

  useEffect(() => {
    setApplicationTypeToPermitMismatch(
      validateIfApplicationTypeCorrespondsToPermitNumber(
        props.formValues?.notice_of_work_type_code,
        props.permits.find((p) => p.permit_guid === props.formValues?.permit_guid)
      )
    );
  }, [props.formValues?.permit_guid, props.formValues?.notice_of_work_type_code]);

  useEffect(() => {
    const isNewPermit = props.formValues?.type_of_application === "New Permit";
    setIsAmendment(!isNewPermit);
    if (!isNewPermit) {
      props.change(formName, "permit_amendment_type_code", permitType);
    }
    if (props.isCoalOrMineral && isNewPermit) {
      props.change(formName, "is_exploration", null);
    }
  }, [props.formValues?.type_of_application]);

  const getPermitType = (selectedPermitGuid) => {
    if (props.permits && props.permits.length > 0) {
      const selectedPermit = props.permits.find(
        (permit) => permit.permit_guid === selectedPermitGuid
      );
      if (selectedPermit.permit_amendments && selectedPermit.permit_amendments.length > 0) {
        const selectedPermitType =
          selectedPermit.permit_amendments.filter(
            (a) => a.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated
          ).length > 0
            ? PERMIT_AMENDMENT_TYPES.amalgamated
            : PERMIT_AMENDMENT_TYPES.amendment;
        setPermitType(selectedPermitType);
        props.change(formName, "permit_amendment_type_code", selectedPermitType);
      }
    }
  };

  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_guid");
  let tooltip = "";
  let isPermitAmendmentTypeDropDownDisabled = true;
  let permitAmendmentDropdown = props.permitAmendmentTypeDropDownOptions;

  if (!isAmendment && permitType !== PERMIT_AMENDMENT_TYPES.original) {
    setPermitType(PERMIT_AMENDMENT_TYPES.original);
  }

  if (permitType === PERMIT_AMENDMENT_TYPES.amalgamated) {
    tooltip = "You can issue only amalgamated permits";
  }
  if (permitType === PERMIT_AMENDMENT_TYPES.original) {
    tooltip = "You can issue only regular permits";
  }
  if (permitType === PERMIT_AMENDMENT_TYPES.amendment) {
    tooltip = "You can issue permits of amalgamated and regular types";
    permitAmendmentDropdown = props.permitAmendmentTypeDropDownOptions.filter(
      (a) => a.value !== PERMIT_AMENDMENT_TYPES.original
    );
    isPermitAmendmentTypeDropDownDisabled = false;
  }

  const filteredApplicationTypeOptions = props.isNoticeOfWorkTypeDisabled
    ? props.applicationTypeOptions
    : props.editableApplicationTypeOptions;

  return (
    <>
      {!props.isNoticeOfWorkTypeDisabled && (
        <Alert
          description="Ensure that you have selected the correct Type of Notice of Work before proceeding. This cannot be changed once drafting has started."
          type="info"
          showIcon
        />
      )}
      {props.isCoalOrMineral && !isAmendment && (
        <Alert
          description="Ensure that you have correctly specified if it is an exploration permit or not. This cannot be changed once drafting has started."
          type="info"
          showIcon
        />
      )}
      <br />
      <FormWrapper onSubmit={() => { }} initialValues={props.initialValues}
        name={FORM.PRE_DRAFT_PERMIT}
        reduxFormConfig={{
          touchOnBlur: true,
          destroyOnUnmount: false,
          forceUnregisterOnUnmount: true,
          enableReinitialize: true,
        }}
      >
        <Row gutter={16}>
          {!props.isNoticeOfWorkTypeDisabled && (
            <Col span={24}>
              <Field
                id="notice_of_work_type_code"
                name="notice_of_work_type_code"
                label="Type of Notice of Work"
                required
                component={RenderSelect}
                data={filteredApplicationTypeOptions}
                validate={[required]}
                disabled={props.isNoticeOfWorkTypeDisabled}
              />
            </Col>
          )}
          <Col span={24}>
            <Field
              id="type_of_application"
              name="type_of_application"
              label="Application Type"
              required
              component={renderConfig.SELECT}
              data={[
                { value: "New Permit", label: "New Permit" },
                { value: "Amendment", label: "Amendment" },
              ]}
              validate={[required]}
              disabled={props.initialValues.disabled}
            />
          </Col>
          <Col span={24}>
            {isAmendment && (
              <div className="left">
                <Field
                  id="permit_guid"
                  name="permit_guid"
                  label="Select a Permit"
                  required
                  doNotPinDropdown
                  component={renderConfig.SELECT}
                  data={permitDropdown}
                  validate={[required]}
                  disabled={props.initialValues.disabled}
                  onChange={(permitGuid) => getPermitType(permitGuid)}
                />
                {applicationTypeToPermitMismatch && (
                  <span style={{ position: "relative", top: "-15px" }} className="has-error">
                    <span className="ant-legacy-form-explain">
                      {applicationTypeToPermitMismatch}
                    </span>
                  </span>
                )}
              </div>
            )}
            {!isAmendment && props.isCoalOrMineral && (
              <div className="ant-form-vertical">
                <Field
                  id="is_exploration"
                  name="is_exploration"
                  label="Exploration Permit"
                  required
                  component={RenderRadioButtons}
                  validate={[requiredRadioButton]}
                />
              </div>
            )}
            <Tooltip title={tooltip} placement="left" mouseEnterDelay={0.3}>
              <p>Select Permit Type*</p>
            </Tooltip>
            <div className="left">
              <Field
                id="permit_amendment_type_code"
                name="permit_amendment_type_code"
                placeholder="Select a Permit amendment type"
                required
                doNotPinDropdown
                component={renderConfig.SELECT}
                data={permitAmendmentDropdown}
                validate={[required]}
                disabled={isPermitAmendmentTypeDropDownDisabled}
              />
            </div>
          </Col>
        </Row>
      </FormWrapper>
    </>
  );
};

PreDraftPermitForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  permitAmendmentTypeDropDownOptions: getDropdownPermitAmendmentTypeOptions(state),
  formValues: getFormValues(FORM.PRE_DRAFT_PERMIT)(state),
  applicationTypeOptions: getDropdownNoticeOfWorkApplicationTypeOptions(state),
  editableApplicationTypeOptions: getNoticeOfWorkEditableTypes(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps)
)(PreDraftPermitForm);
