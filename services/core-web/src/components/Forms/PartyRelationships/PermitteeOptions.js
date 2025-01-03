import React from "react";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import { createDropDownList } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";

const propTypes = {
  minePermits: CustomPropTypes.mine.isRequired,
  isPermitRequired: PropTypes.bool,
  isPermitDropDownDisabled: PropTypes.bool,
};

const defaultProps = {
  isPermitRequired: true,
  isPermitDropDownDisabled: false,
};

export const PermitteeOptions = (props) => {
  const permitDropdown = createDropDownList(props.minePermits, "permit_no", "permit_guid");

  return (
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Field
          id="related_guid"
          name="related_guid"
          label="Permit"
          placeholder="Select a Permit"
          doNotPinDropdown
          component={renderConfig.SELECT}
          data={permitDropdown}
          disabled={props.isPermitDropDownDisabled}
          required={props.isPermitRequired}
          validate={props.isPermitRequired ? [required] : []}
        />
      </Col>
    </Row>
  );
};

PermitteeOptions.propTypes = propTypes;
PermitteeOptions.defaultProps = defaultProps;

export default PermitteeOptions;
