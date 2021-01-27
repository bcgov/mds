import React, { useState, useEffect } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues, change } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Tooltip } from "antd";
import { resetForm, createDropDownList } from "@common/utils/helpers";
import { required, requiredRadioButton } from "@common/utils/Validate";

import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import { getDropdownPermitAmendmentTypeOptions } from "@common/selectors/staticContentSelectors";
import { PERMIT_AMENDMENT_TYPES } from "@common/constants/strings";

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  isCoalOrMineral: PropTypes.bool.isRequired,
  permitAmendmentTypeDropDownOptions: CustomPropTypes.options.isRequired,
  change: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
  formValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const PreDraftPermitForm = (props) => {
  const [permitType, setPermitType] = useState(PERMIT_AMENDMENT_TYPES.original);
  const [isAmendment, setIsAmendment] = useState(
    props.initialValues?.type_of_application !== "New Permit"
  );

  useEffect(() => {
    if (isAmendment) {
      props.change("permit_amendment_type_code", permitType);
    }
    setIsAmendment(props.formValues?.type_of_application !== "New Permit");
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
        props.change("permit_amendment_type_code", selectedPermitType);
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

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="type_of_application"
              name="type_of_application"
              label="Application Type*"
              component={renderConfig.SELECT}
              data={[
                { value: "New Permit", label: "New Permit" },
                { value: "Amendment", label: "Amendment" },
              ]}
              validate={[required]}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          {isAmendment && (
            <div className="left">
              <Form.Item>
                <Field
                  id="permit_guid"
                  name="permit_guid"
                  label="Select a Permit*"
                  doNotPinDropdown
                  component={renderConfig.SELECT}
                  data={permitDropdown}
                  validate={[required]}
                  onChange={(permitGuid) => getPermitType(permitGuid)}
                />
              </Form.Item>
            </div>
          )}
          {!isAmendment && props.isCoalOrMineral && (
            <div className="left">
              <Form.Item>
                <Field
                  id="is_exploration"
                  name="is_exploration"
                  label="Exploration Permit*"
                  component={renderConfig.CHECKBOX}
                  validate={[requiredRadioButton]}
                />
              </Form.Item>
            </div>
          )}
          <Tooltip title={tooltip} placement="left" mouseEnterDelay={0.3}>
            <p>Select Permit Type*</p>
          </Tooltip>
          <div className="left">
            <Form.Item>
              <Field
                id="permit_amendment_type_code"
                name="permit_amendment_type_code"
                placeholder="Select a Permit amendment type"
                doNotPinDropdown
                component={renderConfig.SELECT}
                data={permitAmendmentDropdown}
                validate={[required]}
                disabled={isPermitAmendmentTypeDropDownDisabled}
              />
            </Form.Item>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

PreDraftPermitForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  permitAmendmentTypeDropDownOptions: getDropdownPermitAmendmentTypeOptions(state),
  formValues: getFormValues(FORM.PRE_DRAFT_PERMIT)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.PRE_DRAFT_PERMIT,
    touchOnBlur: true,
    onSubmit: () => {},
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: false,
    onSubmitSuccess: resetForm(FORM.PRE_DRAFT_PERMIT),
  })
)(PreDraftPermitForm);
