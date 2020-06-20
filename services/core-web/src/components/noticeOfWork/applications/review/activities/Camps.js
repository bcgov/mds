import React from "react";
import { PropTypes } from "prop-types";
import { Field, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import { maxLength, number, requiredRadioButton } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  details: CustomPropTypes.activityDetails.isRequired,
  editRecord: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
};

const defaultProps = {};

export const Camps = (props) => {
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
    props.editRecord(activityToChange, "camps.details", rowIndex, isDelete, removeOnly);
  };

  const addActivity = () => {
    const newActivity = {
      activity_type_description: "",
      disturbed_area: "",
      timber_volume: "",
    };
    props.addRecord("camps.details", newActivity);
  };

  const standardColumns = [
    {
      title: "Name",
      dataIndex: "activity_type_description",
      key: "activity_type_description",
      render: (text, record) => (
        <div title="Name">
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
      <h4>Fuel</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Do you propose to store fuel?</div>
          <Field
            id="has_fuel_stored"
            name="has_fuel_stored"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            validate={[requiredRadioButton]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Volume of fuel stored</div>
          <Field
            id="volume_fuel_stored"
            name="volume_fuel_stored"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[number]}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Storage Method</div>
          <Col md={12} sm={24}>
            <Field
              label="Bulk"
              id="has_fuel_stored_in_bulk"
              name="has_fuel_stored_in_bulk"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
              validate={[requiredRadioButton]}
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              label="Barrell"
              id="has_fuel_stored_in_barrels"
              name="has_fuel_stored_in_barrels"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
              validate={[requiredRadioButton]}
            />
          </Col>
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
Camps.propTypes = propTypes;
Camps.defaultProps = defaultProps;

export default connect(
  (state) => ({
    details: selector(state, "camps.details"),
  }),
  null
)(Camps);
