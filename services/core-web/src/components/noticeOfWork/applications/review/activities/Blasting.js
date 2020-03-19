import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { requiredRadioButton } from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
};

export const Blasting = (props) => {
  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">On site storage explosives</div>
          <Field
            id="has_storage_explosive_on_site"
            name="has_storage_explosive_on_site"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            validate={[requiredRadioButton]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Explosive Magazine Storage and Use Permit</div>
          <Field
            id="explosive_permit_issued"
            name="explosive_permit_issued"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            validate={[requiredRadioButton]}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Expiry Date</div>
          <Field
            id="explosive_permit_expiry_date"
            name="explosive_permit_expiry_date"
            component={RenderDate}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Permit Number</div>
          <Field
            id="explosive_permit_number"
            name="explosive_permit_number"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

Blasting.propTypes = propTypes;

export default Blasting;
