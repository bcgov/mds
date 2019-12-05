import React from "react";
import { PropTypes } from "prop-types";
import { bindActionCreators } from "redux";
import { Field, formValueSelector, arrayInsert, arrayRemove, arrayPush } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  details: CustomPropTypes.activityDetails.isRequired,
  equipment: CustomPropTypes.activityEquipment.isRequired,
  arrayInsert: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  arrayPush: PropTypes.func.isRequired,
};

const defaultProps = {};

export const SandGravelQuarry = (props) => {
  const removeRecord = (event, rowIndex) => {
    event.preventDefault();
    props.arrayRemove(FORM.EDIT_NOTICE_OF_WORK, "sand_and_gravel.details", rowIndex);
  };

  const editRecord = (event, rowIndex) => {
    const activityToChange = props.details[rowIndex];
    activityToChange[event.target.name] = event.target.value;
    props.arrayRemove(FORM.EDIT_NOTICE_OF_WORK, "sand_and_gravel.details", rowIndex);
    props.arrayInsert(
      FORM.EDIT_NOTICE_OF_WORK,
      "sand_and_gravel.details",
      rowIndex,
      activityToChange
    );
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
              onChange={(e) => editRecord(e, record.index)}
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
              onChange={(e) => editRecord(e, record.index)}
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
              onChange={(e) => editRecord(e, record.index)}
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
        <Button type="primary" size="small" onClick={(e) => removeRecord(e, record.index)} ghost>
          <img name="remove" src={TRASHCAN} alt="Remove Activity" />
        </Button>
      </div>
    ),
  };

  const columns = (isViewMode) =>
    !isViewMode ? [...standardColumns, removeColumn] : standardColumns;

  const addActivity = () => {
    const newActivity = {
      activity_type_description: null,
      disturbed_area: null,
      timber_volume: null,
    };
    props.arrayPush(FORM.EDIT_NOTICE_OF_WORK, "sand_and_gravel.details", newActivity);
  };

  const transformData = (activityDetails) => {
    return activityDetails.map((activity, index) => ({
      activity_type_description: activity.activity_type_description,
      disturbed_area: activity.disturbed_area,
      timber_volume: activity.timber_volume,
      index,
    }));
  };

  return (
    <div>
      <br />
      <h4>Soil Conservation</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Average Depth Overburden(m)</div>
          <Field
            id="average_overburden_depth"
            name="average_overburden_depth"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Measures to stabilize soil overburden stockpiles and control noxious weeds
          </div>
          <Field
            id="stability_measures_description"
            name="stability_measures_description"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Average Depth of top soil(m)</div>
          <Field
            id="average_top_soil_depth"
            name="average_top_soil_depth"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>

      <br />
      <h4>Land Use</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Is this site within the Agricultural Land Reserve?</div>
          <Field
            id="is_agricultural_land_reserve"
            name="is_agricultural_land_reserve"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Current land use zoning for the site </div>
          <Field
            id="land_use_zoning"
            name="land_use_zoning"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title--light">Permit Application Number**</div>
          <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed land use</div>
          <Field
            id="proposed_land_use"
            name="proposed_land_use"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Does the local government have a soil removal bylaw?</div>
          <Field
            id="has_local_soil_removal_bylaw"
            name="has_local_soil_removal_bylaw"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Estimate total mineable reserves over the life of the mine(m3)
          </div>
          <Field
            id="total_mineable_reserves"
            name="total_mineable_reserves"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Official community plan for the site</div>
          <Field
            id="community_plan"
            name="community_plan"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Estimate annual extraction from site (tonnes/year)</div>
          <Field
            id="total_annual_extraction"
            name="total_annual_extraction"
            component={RenderAutoSizeField}
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
      <Button type="primary" onClick={() => addActivity()}>
        Add Activity
      </Button>
      <br />
      {props.equipment && <Equipment equipment={props.equipment} />}
    </div>
  );
};

const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);
SandGravelQuarry.propTypes = propTypes;
SandGravelQuarry.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      arrayInsert,
      arrayRemove,
      arrayPush,
    },
    dispatch
  );

export default connect(
  (state) => ({
    details: selector(state, "sand_and_gravel.details"),
    equipment: selector(state, "sand_and_gravel.equipment"),
  }),
  mapDispatchToProps
)(SandGravelQuarry);
