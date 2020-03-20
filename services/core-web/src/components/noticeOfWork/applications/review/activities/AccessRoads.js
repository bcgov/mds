import React from "react";
import { PropTypes } from "prop-types";
import { Field, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import { maxLength, number } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import CustomPropTypes from "@/customPropTypes";
import { NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  details: CustomPropTypes.activityDetails.isRequired,
  equipment: CustomPropTypes.activityEquipment.isRequired,
  editRecord: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
};

const defaultProps = {};

export const AccessRoads = (props) => {
  const editActivity = (event, rowIndex, isDelete) => {
    const activityToChange = props.details[rowIndex];
    let removeOnly = false;
    if (isDelete) {
      if (!activityToChange.activity_detail_id) {
        removeOnly = true;
      }
    } else {
      activityToChange[event.target.name] = event.target.value;
    }
    props.editRecord(
      activityToChange,
      "exploration_access.details",
      rowIndex,
      isDelete,
      removeOnly
    );
  };

  const addActivity = () => {
    const newActivity = {
      activity_type_description: "",
      length: "",
      disturbed_area: "",
      timber_volume: "",
    };
    props.addRecord("exploration_access.details", newActivity);
  };

  const standardColumns = [
    {
      title: "Access Type",
      dataIndex: "activity_type_description",
      key: "activity_type_description",
      render: (text, record) => (
        <div title="Access Type">
          <div className="inline-flex">
            <input
              name="activity_type_description"
              type="text"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editActivity(e, record.index, false)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Length(km)",
      dataIndex: "length",
      key: "length",
      render: (text, record) => (
        <div title="Length(km)">
          <div className="inline-flex">
            <input
              name="length"
              type="number"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editActivity(e, record.index, false)}
              parse={(value) => parseInt(value, 10)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Disturbed Area (ha)",
      dataIndex: "disturbed_area",
      key: "disturbed_area",
      render: (text, record) => (
        <div title="Disturbed Area (ha)">
          <div className="inline-flex">
            <input
              name="disturbed_area"
              type="number"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editActivity(e, record.index, false)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Merchantable timber volume (m3)",
      dataIndex: "timber_volume",
      key: "timber_volume",
      render: (text, record) => (
        <div title="Merchantable timber volume (m3)">
          <div className="inline-flex">
            <input
              name="timber_volume"
              type="number"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editActivity(e, record.index, false)}
            />
          </div>
        </div>
      ),
    },
  ];

  const removeColumn = {
    dataIndex: "remove",
    key: "remove",
    render: (text, record) => (
      <div name="remove" title="remove">
        <Button
          type="primary"
          size="small"
          onClick={(event) => editActivity(event, record.index, true)}
          ghost
        >
          <img name="remove" src={TRASHCAN} alt="Remove Activity" />
        </Button>
      </div>
    ),
  };

  const columns = (isViewMode) =>
    !isViewMode ? [...standardColumns, removeColumn] : standardColumns;

  const transformData = (activities) =>
    activities
      .map((activity, index) => ({
        activity_type_description: activity.activity_type_description || "",
        length: activity.length || "",
        disturbed_area: activity.disturbed_area || "",
        timber_volume: activity.timber_volume || "",
        state_modified: activity.state_modified || "",
        index,
      }))
      .filter((activity) => !activity.state_modified);

  return (
    <div>
      <Table
        align="left"
        pagination={false}
        columns={columns(props.isViewMode)}
        dataSource={transformData(props.details || [])}
        locale={{
          emptyText: "No data",
        }}
      />
      {!props.isViewMode && (
        <Button type="primary" onClick={() => addActivity()}>
          Add Activity
        </Button>
      )}
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
            Describe the changes and reference the locations need on map needed later in the
            application.
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
