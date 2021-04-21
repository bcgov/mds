import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { requiredRadioButton } from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import { NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
};

export const Blasting = (props) => {
  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            On-site storage explosives
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("blasting_operation.has_storage_explosive_on_site").value
              }
              isVisible={
                props.renderOriginalValues("blasting_operation.has_storage_explosive_on_site")
                  .edited
              }
            />
          </div>
          <Field
            id="has_storage_explosive_on_site"
            name="has_storage_explosive_on_site"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            validate={[requiredRadioButton]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Explosive Magazine Storage and Use Permit
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("blasting_operation.explosive_permit_issued").value
              }
              isVisible={
                props.renderOriginalValues("blasting_operation.explosive_permit_issued").edited
              }
            />
          </div>
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
          <div className="field-title">
            Expiry Date
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("blasting_operation.explosive_permit_expiry_date").value
              }
              isVisible={
                props.renderOriginalValues("blasting_operation.explosive_permit_expiry_date").edited
              }
            />
          </div>
          <Field
            id="explosive_permit_expiry_date"
            name="explosive_permit_expiry_date"
            component={RenderDate}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Permit Number
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("blasting_operation.explosive_permit_number").value
              }
              isVisible={
                props.renderOriginalValues("blasting_operation.explosive_permit_number").edited
              }
            />
          </div>
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
