import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { currencyMask } from "@common/utils/helpers";
import { maxLength, number, required } from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
};

export const SurfaceDrilling = (props) => {
  return (
    <div>
      <br />
      <h4>Drilling</h4>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="details"
        fieldID="activity_detail_id"
        tableContent={[
          {
            title: "Activity",
            value: "activity_type_description",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: [required],
          },
          {
            title: "Number of Sites",
            value: "number_of_sites",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Disturbed Area (ha)",
            value: "disturbed_area",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Merchantable timber volume (m³)",
            value: "timber_volume",
            component: RenderField,
            validate: [number],
          },
        ]}
      />
      <br />
      <AuthorizationWrapper inTesting>
        <>
          <h4>Support of Drill Program</h4>
          <Row gutter={16}>
            <Col md={18} sm={24}>
              <div className="field-title">
                The Drilling program will be
                {props.isPreLaunch && <NOWFieldOriginTooltip />}
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("exploration_surface_drilling.drill_program").value
                  }
                  isVisible={
                    props.renderOriginalValues("exploration_surface_drilling.drill_program").edited
                  }
                />
              </div>
              <Field
                id="drill_program"
                name="drill_program"
                component={RenderRadioButtons}
                disabled={props.isViewMode}
                customOptions={[
                  { label: "Ground supported", value: "Ground supported" },
                  { label: "Helicopter supported", value: "Helicopter supported" },
                  { label: "Water supported", value: "Water supported" },
                  { label: "Combination of above", value: "Combination of above" },
                ]}
              />
            </Col>
          </Row>
        </>
      </AuthorizationWrapper>
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Describe the location of the Core Storage
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("exploration_surface_drilling.reclamation_core_storage")
                  .value
              }
              isVisible={
                props.renderOriginalValues("exploration_surface_drilling.reclamation_core_storage")
                  .edited
              }
            />
          </div>
          <Field
            id="reclamation_core_storage"
            name="reclamation_core_storage"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("exploration_surface_drilling.reclamation_description")
                  .value
              }
              isVisible={
                props.renderOriginalValues("exploration_surface_drilling.reclamation_description")
                  .edited
              }
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
              originalValue={
                props.renderOriginalValues("exploration_surface_drilling.reclamation_cost").value
              }
              isVisible={
                props.renderOriginalValues("exploration_surface_drilling.reclamation_cost").edited
              }
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

SurfaceDrilling.propTypes = propTypes;

export default SurfaceDrilling;
