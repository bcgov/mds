import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { maxLength, number, required } from "@common/utils/Validate";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  renderOriginalValues: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
};

export const AccessRoads = (props) => {
  return (
    <div>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="details"
        fieldID="activity_detail_id"
        tableContent={[
          {
            title: "Access Type",
            value: "activity_type_description",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: [required],
          },
          {
            title: "Length (km)",
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
            title: "Merchantable timber volume (m³)",
            value: "timber_volume",
            component: RenderField,
            validate: [number],
          },
        ]}
      />
      <br />
      <h4>Bridges, Culverts, and Crossings</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Are you proposing any bridges, culverts, and crossings?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("exploration_access.has_proposed_bridges_or_culverts")
                  .value
              }
              isVisible={
                props.renderOriginalValues("exploration_access.has_proposed_bridges_or_culverts")
                  .edited
              }
            />
          </div>
          <Field
            id="has_proposed_bridges_or_culverts"
            name="has_proposed_bridges_or_culverts"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
          <div className="field-title">
            Describe the changes and reference the locations needed on the map later.
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("exploration_access.bridge_culvert_crossing_description")
                  .value
              }
              isVisible={
                props.renderOriginalValues("exploration_access.bridge_culvert_crossing_description")
                  .edited
              }
            />
          </div>
          <Field
            id="bridge_culvert_crossing_description"
            name="bridge_culvert_crossing_description"
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
                props.renderOriginalValues("exploration_access.reclamation_description").value
              }
              isVisible={
                props.renderOriginalValues("exploration_access.reclamation_description").edited
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
                props.renderOriginalValues("exploration_access.reclamation_cost").value
              }
              isVisible={props.renderOriginalValues("exploration_access.reclamation_cost").edited}
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

AccessRoads.propTypes = propTypes;

export default AccessRoads;
