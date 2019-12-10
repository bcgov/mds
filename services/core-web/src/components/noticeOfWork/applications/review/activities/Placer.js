import React from "react";
import { PropTypes } from "prop-types";
import { Field, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderField from "@/components/common/RenderField";
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

export const Placer = (props) => {
  const editActivity = (event, rowIndex) => {
    const activityToChange = props.details[rowIndex];
    activityToChange[event.target.name] = event.target.value;
    props.editRecord(activityToChange, "placer_operation.details", rowIndex);
  };

  const addActivity = () => {
    const newActivity = {
      activity_type_description: "",
      quantity: "",
      width: "",
      length: "",
      disturbed_area: "",
      timber_volume: "",
    };
    props.addRecord("placer_operation.details", newActivity);
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
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <div title="Quantity">
          <div className="inline-flex">
            <input
              name="quantity"
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
      title: "Width(m)",
      dataIndex: "width",
      key: "width",
      render: (text, record) => (
        <div title="Width(m)">
          <div className="inline-flex">
            <input
              name="width"
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
      title: "Length(km)",
      dataIndex: "length",
      key: "length",
      render: (text, record) => (
        <div title="Length(km)">
          <div className="inline-flex">
            <input
              name="length"
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
          onClick={() => props.removeRecord("placer_operation.details", record.index)}
          ghost
        >
          <img name="remove" src={TRASHCAN} alt="Remove Activity" />
        </Button>
      </div>
    ),
  };

  const columns = (isViewMode) =>
    false && !isViewMode ? [...standardColumns, removeColumn] : standardColumns;

  const transformData = (activities) =>
    activities.map((activity, index) => ({
      activity_type_description: activity.activity_type_description || "",
      width: activity.width || "",
      quantity: activity.quantity || "",
      length: activity.length || "",
      disturbed_area: activity.disturbed_area || "",
      timber_volume: activity.timber_volume || "",
      index,
    }));

  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Is this an application for Underground Placer Operations?
          </div>
          <Field
            id="is_underground"
            name="is_underground"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Is this an application for Hand Operations?</div>
          <Field
            id="is_hand_operation"
            name="is_hand_operation"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
      <Table
        align="left"
        pagination={false}
        columns={columns(props.isViewMode)}
        dataSource={transformData(props.details || [])}
        locale={{
          emptyText: "No data",
        }}
      />
      {false && !props.isViewMode && (
        <Button type="primary" onClick={() => addActivity()}>
          Add Activity
        </Button>
      )}
      <br />
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed Production**</div>
          <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
        </Col>
      </Row>
      <br />
      <Equipment
        equipment={props.equipment}
        isViewMode={props.isViewMode}
        activity="placer_operation"
        removeRecord={props.removeRecord}
        editRecord={props.editRecord}
        addRecord={props.addRecord}
      />

      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Total area of planned reclamation this year</div>
          <Field
            id="total_disturbed_area"
            name="total_disturbed_area"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
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
Placer.propTypes = propTypes;
Placer.defaultProps = defaultProps;

export default connect(
  (state) => ({
    details: selector(state, "placer_operation.details"),
    equipment: selector(state, "placer_operation.equipment"),
  }),
  null
)(Placer);
