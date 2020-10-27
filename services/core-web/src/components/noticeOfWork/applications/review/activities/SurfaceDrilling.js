import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { maxLength, number, required } from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import { NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";
import CoreEditableTable from "@/components/common/CoreEditableTable";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
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
            validate: [required, number],
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
      <h4>Support of the Drilling Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            The Drilling program will be
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
      <br />
      <h4>Reclamation Program</h4>
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
          />
        </Col>
      </Row>
    </div>
  );
};

SurfaceDrilling.propTypes = propTypes;

export default SurfaceDrilling;
