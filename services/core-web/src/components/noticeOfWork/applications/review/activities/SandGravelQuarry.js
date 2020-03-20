import React from "react";
import { PropTypes } from "prop-types";
import { Field, Fields, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col, Table, Button } from "antd";
import { maxLength, number, numberWithUnitCode } from "@common/utils/Validate";
import { getDropdownNoticeOfWorkUnitTypeOptions } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderFieldWithDropdown from "@/components/common/RenderFieldWithDropdown";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  details: CustomPropTypes.activityDetails.isRequired,
  equipment: CustomPropTypes.activityEquipment.isRequired,
  editRecord: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
  unitTypeOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {};

export const SandGravelQuarry = (props) => {
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
    props.editRecord(activityToChange, "sand_and_gravel.details", rowIndex, isDelete, removeOnly);
  };

  const addActivity = () => {
    const newActivity = {
      activity_type_description: "",
      disturbed_area: "",
      timber_volume: "",
    };
    props.addRecord("sand_and_gravel.details", newActivity);
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

  const transformData = (activityDetails) => {
    return activityDetails
      .map((activity, index) => ({
        activity_type_description: activity.activity_type_description || "",
        disturbed_area: activity.disturbed_area || "",
        timber_volume: activity.timber_volume || "",
        state_modified: activity.state_modified || "",
        index,
      }))
      .filter((activity) => !activity.state_modified);
  };

  return (
    <div>
      <h4>Soil Conservation</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Average Depth Overburden</div>
          <Fields
            names={["average_overburden_depth", "average_overburden_depth_unit_type_code"]}
            id="average_overburden_depth"
            dropdownID="average_overburden_depth_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Average Depth of top soil</div>
          <Fields
            names={["average_top_soil_depth", "average_top_soil_depth_unit_type_code"]}
            id="average_top_soil_depth"
            dropdownID="average_top_soil_depth_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
          />
        </Col>
      </Row>
      <Row gutter={16}>
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
          <div className="field-title--light">Permit Application Number</div>
          <Field
            id="agri_lnd_rsrv_permit_application_number"
            name="agri_lnd_rsrv_permit_application_number"
            component={RenderField}
            disabled={props.isViewMode}
          />
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
          <div className="field-title">Official community plan for the site</div>
          <Field
            id="community_plan"
            name="community_plan"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Does the local government have a soil removal bylaw?</div>
          <Field
            id="has_local_soil_removal_bylaw"
            name="has_local_soil_removal_bylaw"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Total mineable reserves over the life of the mine</div>
          <Fields
            names={["total_mineable_reserves", "total_mineable_reserves_unit_type_code"]}
            id="total_mineable_reserves"
            dropdownID="total_mineable_reserves_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Annual extraction from site</div>
          <Fields
            names={["total_annual_extraction", "total_annual_extraction_unit_type_code"]}
            id="total_annual_extraction"
            dropdownID="total_annual_extraction_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
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
      {!props.isViewMode && (
        <Button type="primary" onClick={() => addActivity()}>
          Add Activity
        </Button>
      )}
      <br />
      <Equipment
        equipment={props.equipment}
        isViewMode={props.isViewMode}
        activity="sand_and_gravel"
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
SandGravelQuarry.propTypes = propTypes;
SandGravelQuarry.defaultProps = defaultProps;

export default connect(
  (state) => ({
    details: selector(state, "sand_and_gravel.details"),
    equipment: selector(state, "sand_and_gravel.equipment"),
    unitTypeOptions: getDropdownNoticeOfWorkUnitTypeOptions(state),
  }),
  null
)(SandGravelQuarry);
