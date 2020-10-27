import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { maxLength, number, requiredRadioButton, required } from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
};

export const Camps = (props) => {
  return (
    <div>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="details"
        fieldID="activity_detail_id"
        tableContent={[
          {
            title: "Name",
            value: "activity_type_description",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: [required],
          },
          {
            title: "Disturbed Area (ha)",
            value: "disturbed_area",
            component: RenderField,
            validate: [required, number],
          },
          {
            title: "Merchantable timber volume (m3)",
            value: "timber_volume",
            component: RenderField,
            validate: [required, number],
          },
        ]}
      />
      <br />
      <h4>Fuel</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Do you propose to store fuel?
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("camps.has_fuel_stored").value}
              isVisible={props.renderOriginalValues("camps.has_fuel_stored").edited}
            />
          </div>
          <Field
            id="has_fuel_stored"
            name="has_fuel_stored"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            validate={[requiredRadioButton]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Volume of fuel stored
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("camps.volume_fuel_stored").value}
              isVisible={props.renderOriginalValues("camps.volume_fuel_stored").edited}
            />
          </div>
          <Field
            id="volume_fuel_stored"
            name="volume_fuel_stored"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[number]}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Storage Method</div>
          <Col md={12} sm={24}>
            <Field
              label={
                <span>
                  Bulk
                  <NOWOriginalValueTooltip
                    style={{ marginLeft: "20%" }}
                    originalValue={
                      props.renderOriginalValues("camps.has_fuel_stored_in_bulk").value
                    }
                    isVisible={props.renderOriginalValues("camps.has_fuel_stored_in_bulk").edited}
                  />
                </span>
              }
              id="has_fuel_stored_in_bulk"
              name="has_fuel_stored_in_bulk"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
              validate={[requiredRadioButton]}
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              label={
                <span>
                  Barrel
                  <NOWOriginalValueTooltip
                    style={{ marginLeft: "20%" }}
                    originalValue={
                      props.renderOriginalValues("camps.has_fuel_stored_in_barrels").value
                    }
                    isVisible={
                      props.renderOriginalValues("camps.has_fuel_stored_in_barrels").edited
                    }
                  />
                </span>
              }
              id="has_fuel_stored_in_barrels"
              name="has_fuel_stored_in_barrels"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
              validate={[requiredRadioButton]}
            />
          </Col>
        </Col>
      </Row>
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("camps.reclamation_description").value}
              isVisible={props.renderOriginalValues("camps.reclamation_description").edited}
            />
          </div>
          <Field
            id="reclamation_description"
            name="reclamation_description"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Estimated Cost of reclamation activities described above
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("camps.reclamation_cost").value}
              isVisible={props.renderOriginalValues("camps.reclamation_cost").edited}
            />
          </div>
          <Field
            id="reclamation_cost"
            name="reclamation_cost"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[number]}
          />
        </Col>
      </Row>
    </div>
  );
};

Camps.propTypes = propTypes;

export default Camps;
