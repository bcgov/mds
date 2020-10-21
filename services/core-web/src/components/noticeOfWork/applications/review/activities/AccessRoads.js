import React from "react";
import { PropTypes } from "prop-types";
import { Field, formValueSelector, FieldArray } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Button } from "antd";
import { maxLength, number, required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import CustomPropTypes from "@/customPropTypes";
import { NOWFieldOriginTooltip, NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  renderOriginalValues: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  details: CustomPropTypes.activityDetails.isRequired,
  equipment: CustomPropTypes.activityEquipment.isRequired,
  editRecord: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
};

const defaultProps = {};

const addActivity = (fields) => {
  fields.push({});
};

const removeActivity = (fields, index) => {
  if (fields.get(index) && fields.get(index).activity_detail_id) {
    // add state_modified and set to "delete" for backend
    fields.get(index).state_modified = "delete";

    // move updated object, this will cause rerendering of the react component, setTimeout is required to bypass react optimization
    // eslint-disable-next-line no-constant-condition
    setTimeout(() => {
      const res = fields.move(index, (index = 0 ? index + 1 : index - 1));
      return res;
    }, 1);
  } else {
    fields.remove(index);
  }
};

const renderActivities = ({ fields, isViewMode }) => {
  // resets deleted state if users decided to cancel their changes
  if (isViewMode && fields.length !== 0) {
    fields.getAll().forEach((activity) => {
      // eslint-disable-next-line no-prototype-builtins
      if (activity && activity.hasOwnProperty("state_modified")) {
        delete activity.state_modified;
      }
    });
  }

  const activeRecordsCount =
    fields.length !== 0 ? fields.getAll().filter((activity) => !activity.state_modified).length : 0;

  return (
    <div>
      <div className="ant-table-wrapper">
        <div className={`ant-table ${(!fields || fields.length <= 0) && "ant-table-empty"}`}>
          <div className="ant-table-content">
            <table style={{ tableLayout: "auto" }}>
              <thead className="ant-table-thead">
                <tr>
                  <th className="ant-table-cell">Access Type</th>
                  <th className="ant-table-cell">Length(km)</th>
                  <th className="ant-table-cell">Disturbed Area (ha)</th>
                  <th className="ant-table-cell">Merchantable timber volume (m3)</th>
                  {!isViewMode && <th className="ant-table-cell" />}
                </tr>
              </thead>
              <tbody className="ant-table-tbody">
                {activeRecordsCount > 0 &&
                  fields.map((activity, index) => {
                    const activityObj = fields.get(index);
                    const key = activityObj && (activityObj.activity_detail_id || index);
                    return (
                      (isViewMode || (activityObj && !activityObj.state_modified)) && (
                        <tr className="ant-table-row ant-table-row-level-0" key={key}>
                          <td className="ant-table-cell">
                            <div title="Access Type">
                              <Field
                                name={`${activity}.activity_type_description`}
                                value={activity.activity_type_description}
                                component={RenderField}
                                disabled={isViewMode}
                                validate={[required]}
                              />
                            </div>
                          </td>
                          <td className="ant-table-cell">
                            <div title="Length(km)">
                              <Field
                                name={`${activity}.length`}
                                value={activity.length}
                                component={RenderField}
                                disabled={isViewMode}
                                validate={[required, number]}
                              />
                            </div>
                          </td>
                          <td className="ant-table-cell">
                            <div title="Disturbed Area (ha)">
                              <Field
                                name={`${activity}.disturbed_area`}
                                value={activity.disturbed_area}
                                component={RenderField}
                                disabled={isViewMode}
                                validate={[required, number]}
                              />
                            </div>
                          </td>
                          <td className="ant-table-cell">
                            <div title="Merchantable timber volume (m3)">
                              <Field
                                name={`${activity}.timber_volume`}
                                value={activity.timber_volume}
                                component={RenderField}
                                disabled={isViewMode}
                                validate={[required, number]}
                              />
                            </div>
                          </td>
                          {!isViewMode && (
                            <td className="ant-table-cell">
                              <div name="remove" title="remove">
                                <Button
                                  type="primary"
                                  size="small"
                                  onClick={() => removeActivity(fields, index)}
                                  ghost
                                >
                                  <img name="remove" src={TRASHCAN} alt="Remove Activity" />
                                </Button>
                              </div>
                            </td>
                          )}
                          {isViewMode && <td className="ant-table-cell" />}
                        </tr>
                      )
                    );
                  })}
                {activeRecordsCount <= 0 && (
                  <tr className="ant-table-placeholder">
                    <td colSpan="5" className="ant-table-cell">
                      No Data Yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {!isViewMode && (
        <div>
          <Button type="primary" onClick={() => addActivity(fields)}>
            Add Activity
          </Button>
        </div>
      )}
    </div>
  );
};

export const AccessRoads = (props) => {
  return (
    <div>
      <FieldArray
        name="details"
        component={renderActivities}
        rerenderOnEveryChange
        {...{
          isViewMode: props.isViewMode,
        }}
      />
      <br />
      <h4>Bridges, Culverts, and Crossings</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Are you proposing any bridges, culverts, and crossings?
            <NOWFieldOriginTooltip />
          </div>
          <Field
            id="has_proposed_bridges_or_culverts"
            name="has_proposed_bridges_or_culverts"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
          <div className="field-title">
            Describe the changes and reference the locations needed on the map later.
            <NOWFieldOriginTooltip />
          </div>
          <Field
            id="bridge_culvert_crossing_description"
            name="bridge_culvert_crossing_description"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
      <Equipment
        equipment={props.equipment}
        isViewMode={props.isViewMode}
        activity="exploration_access"
        editRecord={props.editRecord}
        addRecord={props.addRecord}
      />
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

const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);
AccessRoads.propTypes = propTypes;
AccessRoads.defaultProps = defaultProps;

export default connect(
  (state) => ({
    details: selector(state, "exploration_access.details"),
    equipment: selector(state, "exploration_access.equipment"),
  }),
  null
)(AccessRoads);
