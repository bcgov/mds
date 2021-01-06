import React, { useState, useEffect } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues, change } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Tooltip } from "antd";
import { required, requiredRadioButton } from "@common/utils/Validate";
import { resetForm, createDropDownList } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import { getDropdownPermitAmendmentTypeOptions } from "@common/selectors/staticContentSelectors";

const propTypes = {
  isAmendment: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  isCoalOrMineral: PropTypes.bool.isRequired,
  permitAmendmentTypeDropDownOptions: CustomPropTypes.options.isRequired,
};

export const PreDraftPermitForm = (props) => {
  const [permitType, setPermitType] = useState("OGP");

  useEffect(() => {
    if (!props.isAmendment) {
      props.change("permit_amendment_type_code", permitType);
    }
  });

  const getPermitType = (selectedPermitGuid) => {
    // TODO remove console logs
    console.log("@@@@@@@@@");
    console.log(selectedPermitGuid);
    console.log(props.permits);

    if (props.permits && props.permits.length > 0) {
      const permit = props.permits.find((permit) => permit.permit_guid === selectedPermitGuid);
      if (permit.permit_amendments && permit.permit_amendments.length > 0) {
        const permitType =
          permit.permit_amendments.filter((a) => a.permit_amendment_type_code === "ALG").length > 0
            ? "ALG"
            : "AMD";
        setPermitType(permitType);
        props.change("permit_amendment_type_code", permitType);
      }
    }
  };

  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_guid");
  let tooltip = "";
  let isPermitAmendmentTypeDropDownDisabled = true;
  let permitAmendmentDropdown = props.permitAmendmentTypeDropDownOptions;

  if (permitType === "ALG") {
    tooltip = "You can issue only amalgamated permits";
  }
  if (permitType === "OGP") {
    tooltip = "You can issue only regular permits";
  }
  if (permitType === "AMD") {
    tooltip = "You can issue permits of amalgamated and regular types";
    permitAmendmentDropdown = props.permitAmendmentTypeDropDownOptions.filter(
      (a) => a.value !== "OGP"
    );
    isPermitAmendmentTypeDropDownDisabled = false;
  }

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col span={24}>
          {props.isAmendment && (
            <div className="left">
              <Form.Item>
                <Field
                  id="permit_guid"
                  name="permit_guid"
                  placeholder="Select a Permit*"
                  doNotPinDropdown
                  component={renderConfig.SELECT}
                  data={permitDropdown}
                  validate={[required]}
                  onChange={(permitGuid) => getPermitType(permitGuid)}
                />
              </Form.Item>
            </div>
          )}
          {!props.isAmendment && props.isCoalOrMineral && (
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
            <p>Please select a permit type.*</p>
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
    onSubmitSuccess: resetForm(FORM.PRE_DRAFT_PERMIT),
    onSubmit: () => {},
  })
)(PreDraftPermitForm);
