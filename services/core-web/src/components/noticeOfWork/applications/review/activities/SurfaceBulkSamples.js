import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { maxLength, number, required } from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";

import { NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
};

export const SurfaceBulkSamples = (props) => {
  return (
    <div>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="details"
        fieldID="activity_detail_id"
        tableContent={[
          {
            title: "Activity",
            value: "activity_type_description",
            component: RenderAutoSizeField,
            validate: [required],
          },
          {
            title: "Quantity",
            value: "quantity",
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
            title: "Merchantable timber volume (m3)",
            value: "timber_volume",
            component: RenderField,
            validate: [number],
          },
        ]}
      />
      <br />
      <br />
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Processing Methods*
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("surface_bulk_sample.processing_method_description")
                  .value
              }
              isVisible={
                props.renderOriginalValues("surface_bulk_sample.processing_method_description")
                  .edited
              }
            />
          </div>
          <Field
            id="processing_method_description"
            name="processing_method_description"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[required]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Bedrock excavation
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("surface_bulk_sample.has_bedrock_excavation").value
              }
              isVisible={
                props.renderOriginalValues("surface_bulk_sample.has_bedrock_excavation").edited
              }
            />
          </div>
          <Field
            id="has_bedrock_excavation"
            name="has_bedrock_excavation"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            If the material has potential for spontaneous combustion, give details of separate
            handling.
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("surface_bulk_sample.handling_instructions").value
              }
              isVisible={
                props.renderOriginalValues("surface_bulk_sample.handling_instructions").edited
              }
            />
          </div>
          <Field
            id="handling_instructions"
            name="handling_instructions"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
      <Equipment isViewMode={props.isViewMode} />
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("surface_bulk_sample.reclamation_description").value
              }
              isVisible={
                props.renderOriginalValues("surface_bulk_sample.reclamation_description").edited
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
                props.renderOriginalValues("surface_bulk_sample.reclamation_cost").value
              }
              isVisible={props.renderOriginalValues("surface_bulk_sample.reclamation_cost").edited}
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

SurfaceBulkSamples.propTypes = propTypes;

export default SurfaceBulkSamples;
