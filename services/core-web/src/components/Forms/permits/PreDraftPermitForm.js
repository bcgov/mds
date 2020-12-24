import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Tooltip } from "antd";
import { required, requiredRadioButton } from "@common/utils/Validate";
import { resetForm, createDropDownList } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isAmendment: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  isCoalOrMineral: PropTypes.bool.isRequired,
  permitAmendmentTypeDropDownOptions: CustomPropTypes.options.isRequired,
  permitType: PropTypes.string,
};

const defaultProps = {
  permitType: "OGP",
};

export const PreDraftPermitForm = (props) => {
  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_guid");
  // const isPermitAmendmentTypeDropDownDisabled =
  //   props.permitType === "ALG" || props.permitType === "OGP";
  // const permitAmendmentDropdown = isPermitAmendmentTypeDropDownDisabled
  //   ? props.permitAmendmentTypeDropDownOptions
  //   : props.permitAmendmentTypeDropDownOptions.filter((a) => a.value !== "OGP");

  let tooltip = "";
  let isPermitAmendmentTypeDropDownDisabled = false;
  let permitAmendmentDropdown = [];

  switch (props.permitType) {
    case "ALG": {
      tooltip = "You can issue only amalgamated permits";
      permitAmendmentDropdown = props.permitAmendmentTypeDropDownOptions;
      isPermitAmendmentTypeDropDownDisabled = true;
    }
    // break;
    case "OGP": {
      tooltip = "You can issue only regular permits";
      permitAmendmentDropdown = props.permitAmendmentTypeDropDownOptions;
      isPermitAmendmentTypeDropDownDisabled = true;
    }
    // break;
    default:
    case "AMD":
      {
        tooltip = "You can issue permits of amalgamated and regular types";
        permitAmendmentDropdown = props.permitAmendmentTypeDropDownOptions.filter(
          (a) => a.value !== "OGP"
        );
        isPermitAmendmentTypeDropDownDisabled = false;
      }
      break;
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
PreDraftPermitForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.PRE_DRAFT_PERMIT,
  touchOnBlur: true,
  onSubmitSuccess: resetForm(FORM.PRE_DRAFT_PERMIT),
  onSubmit: () => {},
})(PreDraftPermitForm);
