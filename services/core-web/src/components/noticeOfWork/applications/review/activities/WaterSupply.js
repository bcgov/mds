import React from "react";
import { PropTypes } from "prop-types";
import { Field, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
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

export const WaterSupply = (props) => {
  const editActivity = (event, rowIndex) => {
    const activityToChange = props.details[rowIndex];
    activityToChange[event.target.name] = event.target.value;
    props.editRecord(activityToChange, "water_supply.details", rowIndex);
  };

  const addActivity = () => {
    const newActivity = {
      supply_source_description: "",
      activity_type_description: "",
      water_use_description: "",
      estimate_rate: "",
    };
    props.addRecord("water_supply.details", newActivity);
  };

  const standardColumns = [
    {
      title: "Source",
      dataIndex: "supply_source_description",
      key: "supply_source_description",
      render: (text, record) => (
        <div title="Source">
          <div className="inline-flex">
            <input
              name="supply_source_description"
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
      title: "Water Use",
      dataIndex: "water_use_description",
      key: "water_use_description",
      render: (text, record) => (
        <div title="Water Use">
          <div className="inline-flex">
            <input
              name="water_use_description"
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
      title: "Estimate",
      dataIndex: "estimate_rate",
      key: "estimate_rate",
      render: (text, record) => (
        <div title="Estimate">
          <div className="inline-flex">
            <input
              name="estimate_rate"
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
          onClick={() => props.removeRecord("water_supply.details", record.index)}
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
      supply_source_description: activity.supply_source_description || "",
      activity_type_description: activity.activity_type_description || "",
      water_use_description: activity.water_use_description || "",
      estimate_rate: activity.estimate_rate || "",
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
      {false && !props.isViewMode && (
        <Button type="primary" onClick={() => addActivity()}>
          Add Activity
        </Button>
      )}
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
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Estimated Cost of reclamation activities described above
          </div>
          <Field
            id="reclamation_description"
            name="reclamation_description"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);
WaterSupply.propTypes = propTypes;
WaterSupply.defaultProps = defaultProps;

export default connect(
  (state) => ({
    details: selector(state, "water_supply.details"),
  }),
  null
)(WaterSupply);
