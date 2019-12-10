import React from "react";
import { PropTypes } from "prop-types";
import { Field, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  details: CustomPropTypes.activityDetails.isRequired,
  equipment: CustomPropTypes.activityEquipment.isRequired,
  removeRecord: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
};
const defaultProps = {};

export const MechanicalTrenching = (props) => {
  const editActivity = (event, rowIndex) => {
    const activityToChange = props.details[rowIndex];
    activityToChange[event.target.name] = event.target.value;
    props.editRecord(activityToChange, "mechanical_trenching.details", rowIndex);
  };

  const addActivity = () => {
    const newActivity = {
      activity_type_description: "",
      number_of_sites: "",
      disturbed_area: "",
      timber_volume: "",
    };
    props.addRecord("mechanical_trenching.details", newActivity);
  };

  const standardColumns = [
    {
      title: "Activity",
      dataIndex: "activity_type_description",
      key: "activity_type_description",
      render: (text, record) => (
        <div title="Activity">
          <div className="inline-flex">
            <input
              name="activity_type_description"
              type="text"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editActivity(e, record.index)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Number of Sites",
      dataIndex: "number_of_sites",
      key: "number_of_sites",
      render: (text, record) => (
        <div title="Number of Sites">
          <div className="inline-flex">
            <input
              name="number_of_sites"
              type="text"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editActivity(e, record.index)}
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
              type="text"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editActivity(e, record.index)}
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
              type="text"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editActivity(e, record.index)}
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
          onClick={() => props.removeRecord("mechanical_trenching.details", record.index)}
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
    activities.map((activity, index) => ({
      activity_type_description: activity.activity_type_description || "",
      number_of_sites: activity.number_of_sites || "",
      disturbed_area: activity.disturbed_area || "",
      timber_volume: activity.timber_volume || "",
      index,
    }));

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
      <Equipment
        equipment={props.equipment}
        isViewMode={props.isViewMode}
        activity="mechanical_trenching"
        removeRecord={props.removeRecord}
        editRecord={props.editRecord}
        addRecord={props.addRecord}
      />
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
          />
        </Col>
      </Row>
    </div>
  );
};

const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);
MechanicalTrenching.propTypes = propTypes;
MechanicalTrenching.defaultProps = defaultProps;

export default connect(
  (state) => ({
    details: selector(state, "mechanical_trenching.details"),
    equipment: selector(state, "mechanical_trenching.equipment"),
  }),
  null
)(MechanicalTrenching);
