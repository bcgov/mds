import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { currencyMask } from "@common/utils/helpers";
import { maxLength, number, required } from "@mds/common/redux/utils/Validate";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
};

export const SurfaceBulkSamples = (props) => {
  return (
    <div>
      <h4>Activities</h4>
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
            title: "Merchantable timber volume (m³)",
            value: "timber_volume",
            component: RenderField,
            validate: [number],
          },
        ]}
      />
      <br />
      <br />
      <h4>Processing Methods</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Describe handling and on-site processing methods
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
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <h4>Bedrock Excavation</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposing bedrock excavation that will be 1,000 tonnes or more?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              style={{ marginLeft: "5%" }}
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
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            If the material has potential for spontaneous combustion, give details of separate
            handling.
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
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
        <Col md={12} sm={24}>
          <div className="field-title">
            Surface water drainage and mitigation strategies
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("surface_bulk_sample.drainage_mitigation_description")
                  .value
              }
              isVisible={
                props.renderOriginalValues("surface_bulk_sample.drainage_mitigation_description")
                  .edited
              }
            />
          </div>
          <Field
            id="drainage_mitigation_description"
            name="drainage_mitigation_description"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity*
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
            required
            validate={[maxLength(4000), required]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Estimated Cost of reclamation activities described above*
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
            required
            validate={[number, required]}
            {...currencyMask}
          />
        </Col>
      </Row>
    </div>
  );
};

SurfaceBulkSamples.propTypes = propTypes;

export default SurfaceBulkSamples;
