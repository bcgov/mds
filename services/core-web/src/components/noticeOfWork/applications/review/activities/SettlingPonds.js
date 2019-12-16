import React from "react";
import { PropTypes } from "prop-types";
import { Field, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
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

export const SettlingPonds = (props) => {
  const editActivity = (event, rowIndex) => {
    const activityToChange = props.details[rowIndex];
    activityToChange[event.target.name] = event.target.value;
    props.editRecord(activityToChange, "settling_pond.details", rowIndex);
  };

  const addActivity = () => {
    const newActivity = {
      activity_type_description: "",
      width: "",
      length: "",
      depth: "",
      disturbed_area: "",
      timber_volume: "",
      water_source_description: "",
      construction_plan: "",
    };
    props.addRecord("settling_pond.details", newActivity);
  };

  const standardColumns = [
    {
      title: "Pond ID",
      dataIndex: "activity_type_description",
      key: "activity_type_description",
      render: (text, record) => (
        <div title="Pond ID">
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
      title: "Depth(m)",
      dataIndex: "depth",
      key: "depth",
      render: (text, record) => (
        <div title="Depth(m)">
          <div className="inline-flex">
            <input
              name="depth"
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
    {
      title: "Water Source",
      dataIndex: "water_source_description",
      key: "water_source_description",
      render: (text, record) => (
        <div title="Water Source">
          <div className="inline-flex">
            <input
              name="water_source_description"
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
      title: "Construction Method",
      dataIndex: "construction_plan",
      key: "construction_plan",
      render: (text, record) => (
        <div title="Construction Method">
          <div className="inline-flex">
            <input
              name="construction_plan"
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
          onClick={() => props.removeRecord("settling_pond.details", record.index)}
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
      depth: activity.depth || "",
      length: activity.length || "",
      disturbed_area: activity.disturbed_area || "",
      timber_volume: activity.timber_volume || "",
      water_source_description: activity.water_source_description || "",
      construction_plan: activity.construction_plan || "",
      index,
    }));

  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Describe the waste water treatment facility (settling pond design, recycling, distance
            from creek, etc.)**
          </div>
          <Field id="" name="" component={RenderAutoSizeField} disabled />
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
          <div className="field-title">
            Disposal of fines from clean out (i.e. use as a subsoil material)**
          </div>
          <Field id="" name="" component={RenderAutoSizeField} disabled />
        </Col>
      </Row>
      <Row gutter={16}>
        <div className="field-title">Water from Ponds will be</div>
        <Col md={8} sm={24}>
          <Field
            label="Recycled"
            id="is_ponds_recycled"
            name="is_ponds_recycled"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={8} sm={24}>
          <Field
            label="Exfiltrated to Ground"
            id="is_ponds_exfiltrated"
            name="is_ponds_exfiltrated"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={8} sm={24}>
          <Field
            label="Discharged to Environment"
            id="is_ponds_discharged"
            name="is_ponds_discharged"
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
SettlingPonds.propTypes = propTypes;
SettlingPonds.defaultProps = defaultProps;

export default connect(
  (state) => ({
    details: selector(state, "settling_pond.details"),
  }),
  null
)(SettlingPonds);
