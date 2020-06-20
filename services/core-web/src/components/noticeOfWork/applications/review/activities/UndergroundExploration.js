import React from "react";
import { PropTypes } from "prop-types";
import { Field, Fields, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import {
  getDropdownNoticeOfWorkUndergroundExplorationTypeOptions,
  getDropdownNoticeOfWorkUnitTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { numberWithUnitCode } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import RenderField from "@/components/common/RenderField";
import RenderFieldWithDropdown from "@/components/common/RenderFieldWithDropdown";
import CustomPropTypes from "@/customPropTypes";
import { NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  details: CustomPropTypes.activityDetails.isRequired,
  editRecord: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
  unitTypeOptions: CustomPropTypes.options.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  undergroundExplorationTypeOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {};

export const UndergroundExploration = (props) => {
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
      "underground_exploration.details",
      rowIndex,
      isDelete,
      removeOnly
    );
  };

  const addActivity = () => {
    const newActivity = {
      underground_exploration_type_code: "",
      activity_type_description: "",
      quantity: "",
      incline: "",
      width: "",
      length: "",
      height: "",
      disturbed_area: "",
      timber_volume: "",
    };
    props.addRecord("underground_exploration.details", newActivity);
  };

  const standardColumns = [
    {
      title: "Exploration Type",
      dataIndex: "underground_exploration_type_code",
      key: "underground_exploration_type_code",
      render: (text, record) => (
        <div title="Exploration Type">
          <select
            style={{ width: "150px" }}
            name="underground_exploration_type_code"
            value={text}
            disabled={props.isViewMode}
            onChange={(e) => editActivity(e, record.index, false)}
          >
            {props.undergroundExplorationTypeOptions.map((type) => (
              <option value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      title: "Activity",
      dataIndex: "activity_type_description",
      key: "activity_type_description",
      render: (text, record) => (
        <div title="Activity">
          <input
            name="activity_type_description"
            type="text"
            disabled={props.isViewMode}
            value={text}
            onChange={(e) => editActivity(e, record.index, false)}
          />
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <div title="Quantity">
          <input
            name="quantity"
            type="number"
            disabled={props.isViewMode}
            value={text}
            onChange={(e) => editActivity(e, record.index, false)}
          />
        </div>
      ),
    },
    {
      title: "Incline",
      dataIndex: "incline",
      key: "incline",
      render: (text, record) => (
        <div title="Incline" className="inline-flex">
          <input
            name="incline"
            type="text"
            disabled={props.isViewMode}
            value={text}
            onChange={(e) => editActivity(e, record.index, false)}
          />
        </div>
      ),
    },
    {
      title: "Width(m)",
      dataIndex: "width",
      key: "width",
      render: (text, record) => (
        <div title="Width(m)">
          <input
            name="width"
            type="number"
            disabled={props.isViewMode}
            value={text}
            onChange={(e) => editActivity(e, record.index, false)}
          />
        </div>
      ),
    },
    {
      title: "Length(km)",
      dataIndex: "length",
      key: "length",
      render: (text, record) => (
        <div title="Length(km)">
          <input
            name="length"
            type="number"
            disabled={props.isViewMode}
            value={text}
            onChange={(e) => editActivity(e, record.index, false)}
          />
        </div>
      ),
    },
    {
      title: "Height(m)",
      dataIndex: "height",
      key: "height",
      render: (text, record) => (
        <div title="Height(m)">
          <input
            name="height"
            type="number"
            disabled={props.isViewMode}
            value={text}
            onChange={(e) => editActivity(e, record.index, false)}
          />
        </div>
      ),
    },
    {
      title: "Disturbed Area (ha)",
      dataIndex: "disturbed_area",
      key: "disturbed_area",
      render: (text, record) => (
        <div title="Disturbed Area (ha)">
          <input
            name="disturbed_area"
            type="number"
            disabled={props.isViewMode}
            value={text}
            onChange={(e) => editActivity(e, record.index, false)}
          />
        </div>
      ),
    },
    {
      title: "Merchantable timber volume (m3)",
      dataIndex: "timber_volume",
      key: "timber_volume",
      render: (text, record) => (
        <div title="Merchantable timber volume (m3)">
          <input
            name="timber_volume"
            type="number"
            disabled={props.isViewMode}
            value={text}
            onChange={(e) => editActivity(e, record.index, false)}
          />
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
        underground_exploration_type_code: activity.underground_exploration_type_code || "",
        quantity: activity.quantity || "",
        incline: activity.incline || "",
        incline_unit_type_code: activity.incline_unit_type_code || "",
        length: activity.length || "",
        width: activity.width || "",
        height: activity.height || "",
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
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed Activities
            <NOWFieldOriginTooltip />
          </div>
          <Field
            id="proposed_activity"
            name="proposed_activity"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Total Ore</div>
          <Fields
            names={["total_ore_amount", "total_ore_unit_type_code"]}
            id="total_ore_amount"
            dropdownID="total_ore_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Total Waste</div>
          <Fields
            names={["total_waste_amount", "total_waste_unit_type_code"]}
            id="total_waste_amount"
            dropdownID="total_waste_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
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
    undergroundExplorationTypeOptions: getDropdownNoticeOfWorkUndergroundExplorationTypeOptions(
      state
    ),
    unitTypeOptions: getDropdownNoticeOfWorkUnitTypeOptions(state),
  }),
  null
)(UndergroundExploration);
