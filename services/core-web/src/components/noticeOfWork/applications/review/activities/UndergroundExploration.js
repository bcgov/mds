import React from "react";
import { PropTypes } from "prop-types";
import { Field, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import RenderField from "@/components/common/RenderField";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  details: CustomPropTypes.activityDetails.isRequired,
  // removeRecord is being passed into conditionally rendered button but eslint assumes it isn't being used
  // eslint-disable-next-line
  removeRecord: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
};

const defaultProps = {};

export const UndergroundExploration = (props) => {
  const editActivity = (event, rowIndex) => {
    const activityToChange = props.details[rowIndex];
    activityToChange[event.target.name] = event.target.value;
    props.editRecord(activityToChange, "underground_exploration.details", rowIndex);
  };

  const addActivity = () => {
    const newActivity = {
      activity_type_description: "",
      quantity: "",
      disturbed_area: "",
      timber_volume: "",
    };
    props.addRecord("underground_exploration.details", newActivity);
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
      title: "Incline",
      dataIndex: "incline_unit_type_code",
      key: "incline_unit_type_code",
      render: (text, record) => (
        <div title="Incline">
          <div className="inline-flex">
            <input
              name="incline_unit_type_code"
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
      title: "Units",
      dataIndex: "units",
      key: "units",
      render: (text, record) => (
        <div title="Units">
          <div className="inline-flex">
            <input
              name="units"
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
      title: "Height(m)",
      dataIndex: "height",
      key: "height",
      render: (text, record) => (
        <div title="Height(m)">
          <div className="inline-flex">
            <input
              name="height"
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
          onClick={() => props.removeRecord("underground_exploration.details", record.index)}
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
      quantity: activity.quantity || "",
      incline_unit_type_code: activity.incline_unit_type_code || "",
      units: activity.units || "",
      length: activity.length || "",
      width: activity.width || "",
      height: activity.height || "",
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
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed Activities**</div>
          <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Total Ore</div>
          <Field
            id="total_ore_amount"
            name="total_ore_amount"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Total Waste</div>
          <Field
            id="total_waste_amount"
            name="total_waste_amount"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);
UndergroundExploration.propTypes = propTypes;
UndergroundExploration.defaultProps = defaultProps;

export default connect(
  (state) => ({
    details: selector(state, "underground_exploration.details"),
  }),
  null
)(UndergroundExploration);
