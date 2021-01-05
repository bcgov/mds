import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { maxLength, number, required } from "@common/utils/Validate";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderField from "@/components/common/RenderField";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
};

export const Placer = (props) => {
  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Is this an application for Underground Placer Operations?
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("placer_operation.is_underground").value}
              isVisible={props.renderOriginalValues("placer_operation.is_underground").edited}
            />
          </div>
          <Field
            id="is_underground"
            name="is_underground"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Is this an application for Hand Operations?
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("placer_operation.is_hand_operation").value}
              isVisible={props.renderOriginalValues("placer_operation.is_hand_operation").edited}
            />
          </div>
          <Field
            id="is_hand_operation"
            name="is_hand_operation"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
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
            title: "Quantity",
            value: "quantity",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Width(m)",
            value: "width",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Length(km)",
            value: "length",
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
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed Production
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("placer_operation.proposed_production").value
              }
              isVisible={props.renderOriginalValues("placer_operation.proposed_production").edited}
            />
          </div>
          <Field
            id="proposed_production"
            name="proposed_production"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
      <Equipment isViewMode={props.isViewMode} />

      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Total area of planned reclamation this year
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("placer_operation.total_disturbed_area").value
              }
              isVisible={props.renderOriginalValues("placer_operation.total_disturbed_area").edited}
            />
          </div>
          <Field
            id="total_disturbed_area"
            name="total_disturbed_area"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[number]}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("placer_operation.reclamation_description").value
              }
              isVisible={
                props.renderOriginalValues("placer_operation.reclamation_description").edited
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
              originalValue={props.renderOriginalValues("placer_operation.reclamation_cost").value}
              isVisible={props.renderOriginalValues("placer_operation.reclamation_cost").edited}
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

Placer.propTypes = propTypes;

export default Placer;
