import React from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { Row, Col } from "antd";
import { currencyMask } from "@common/utils/helpers";
import { maxLength, number, requiredRadioButton, required } from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
  campFormValues: PropTypes.objectOf(CustomPropTypes.camps).isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
};

export const Camps = (props) => {
  const hasFuel = props.campFormValues.has_fuel_stored;
  return (
    <div>
      <h4>
        Camps
        {props.isPreLaunch && <NOWFieldOriginTooltip />}
      </h4>
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
            title: "People in Camp",
            value: "number_people",
            component: RenderField,
            minRows: 1,
            // only force the required prop on the new fields of new applications, existing applications will not be required as it is forced data cleanup.
            validate: props.isPreLaunch ? [number] : [number, required],
          },
          {
            title: "Number of Structures",
            value: "number_structures",
            component: RenderField,
            minRows: 1,
            validate: props.isPreLaunch ? [number] : [number, required],
          },
          {
            title: "Description of Structures",
            value: "description_of_structures",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: props.isPreLaunch ? [] : [required],
          },
          {
            title: "Waste Disposal",
            value: "waste_disposal",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: props.isPreLaunch ? [] : [required],
          },
          {
            title: "Sanitary Facilities",
            value: "sanitary_facilities",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: props.isPreLaunch ? [] : [required],
          },
          {
            title: "Water Supply",
            value: "water_supply",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: props.isPreLaunch ? [] : [required],
          },
          {
            title: "Quantity of Water",
            value: "quantity",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: props.isPreLaunch ? [] : [required],
          },
          {
            title: "Disturbed Area (ha)",
            value: "disturbed_area",
            component: RenderField,
            validate: [number, required],
          },
          {
            title: "Merchantable timber volume (m³)",
            value: "timber_volume",
            component: RenderField,
            validate: [number, required],
          },
        ]}
      />
      <br />
      <Row gutter={16}>
        <Col md={24}>
          <div className="field-title">
            Notified the local Health Authority as you have a camp for more than 5 people planned?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("camp.health_authority_notified").value}
              isVisible={props.renderOriginalValues("camp.health_authority_notified").edited}
              style={{ marginLeft: "5px" }}
            />
          </div>
          <Field
            id="health_authority_notified"
            name="health_authority_notified"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={24}>
          <div className="field-title">
            Consent given to share name, address and contact information with the local Health
            Authority?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("camp.health_authority_consent").value}
              isVisible={props.renderOriginalValues("camp.health_authority_consent").edited}
              style={{ marginLeft: "5px" }}
            />
          </div>
          <Field
            id="health_authority_consent"
            name="health_authority_consent"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
      <h4>
        Buildings
        {props.isPreLaunch && <NOWFieldOriginTooltip />}
      </h4>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="building_details"
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
            title: "Purpose",
            value: "purpose",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: [required],
          },
          {
            title: "Structure",
            value: "structure",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: [required],
          },
          {
            title: "Disturbed Area (ha)",
            value: "disturbed_area",
            component: RenderField,
            validate: [number, required],
          },
          {
            title: "Merchantable timber volume (m³)",
            value: "timber_volume",
            component: RenderField,
            validate: [number, required],
          },
        ]}
      />
      <br />
      <h4>
        Staging Areas
        {props.isPreLaunch && <NOWFieldOriginTooltip />}
      </h4>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="staging_area_details"
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
            validate: [number, required],
          },
          {
            title: "Merchantable timber volume (m³)",
            value: "timber_volume",
            component: RenderField,
            validate: [number, required],
          },
        ]}
      />
      <br />
      <h4>Fuel / Lubricant Storage</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Do you propose to store fuel?
            <NOWOriginalValueTooltip
              style={{ marginLeft: "5%" }}
              originalValue={props.renderOriginalValues("camp.has_fuel_stored").value}
              isVisible={props.renderOriginalValues("camp.has_fuel_stored").edited}
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
            Volume of fuel stored (litres)
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("camp.volume_fuel_stored").value}
              isVisible={props.renderOriginalValues("camp.volume_fuel_stored").edited}
            />
          </div>
          <Field
            id="volume_fuel_stored"
            name="volume_fuel_stored"
            component={RenderField}
            disabled={props.isViewMode}
            validate={hasFuel ? [number, required] : [number]}
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
                    originalValue={props.renderOriginalValues("camp.has_fuel_stored_in_bulk").value}
                    isVisible={props.renderOriginalValues("camp.has_fuel_stored_in_bulk").edited}
                  />
                </span>
              }
              id="has_fuel_stored_in_bulk"
              name="has_fuel_stored_in_bulk"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
              validate={hasFuel ? [requiredRadioButton] : []}
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
                      props.renderOriginalValues("camp.has_fuel_stored_in_barrels").value
                    }
                    isVisible={props.renderOriginalValues("camp.has_fuel_stored_in_barrels").edited}
                  />
                </span>
              }
              id="has_fuel_stored_in_barrels"
              name="has_fuel_stored_in_barrels"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
              validate={hasFuel ? [requiredRadioButton] : []}
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
              originalValue={props.renderOriginalValues("camp.reclamation_description").value}
              isVisible={props.renderOriginalValues("camp.reclamation_description").edited}
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
              originalValue={props.renderOriginalValues("camp.reclamation_cost").value}
              isVisible={props.renderOriginalValues("camp.reclamation_cost").edited}
            />
          </div>
          <Field
            id="reclamation_cost"
            name="reclamation_cost"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[number]}
            {...currencyMask}
          />
        </Col>
      </Row>
    </div>
  );
};

Camps.propTypes = propTypes;

export default connect(
  (state) => ({
    campFormValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state).camp || {},
  }),
  null
)(Camps);
