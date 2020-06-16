import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { isNull } from "lodash";
import { Row, Col } from "antd";
import { requiredRadioButton } from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import { NOWOrigionalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  originalValuesIfEdited: PropTypes.objectOf(PropTypes.strings).isRequired,
};

export const Blasting = (props) => {
  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            On site storage explosives
            <NOWOrigionalValueTooltip
              origionalValue={
                props.originalValuesIfEdited["blasting_operation.has_storage_explosive_on_site"]
              }
              isVisible={
                !isNull(
                  props.originalValuesIfEdited["blasting_operation.has_storage_explosive_on_site"]
                )
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
            <NOWOrigionalValueTooltip
              origionalValue={
                props.originalValuesIfEdited["blasting_operation.explosive_permit_issued"]
              }
              isVisible={
                !isNull(props.originalValuesIfEdited["blasting_operation.explosive_permit_issued"])
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
            <NOWOrigionalValueTooltip
              origionalValue={
                props.originalValuesIfEdited["blasting_operation.explosive_permit_expiry_date"]
              }
              isVisible={
                !isNull(
                  props.originalValuesIfEdited["blasting_operation.explosive_permit_expiry_date"]
                )
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
            <NOWOrigionalValueTooltip
              origionalValue={
                props.originalValuesIfEdited["blasting_operation.explosive_permit_number"]
              }
              isVisible={
                !isNull(props.originalValuesIfEdited["blasting_operation.explosive_permit_number"])
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
