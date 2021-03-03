import React from "react";
import { PropTypes } from "prop-types";
import { Field, Fields } from "redux-form";
import { connect } from "react-redux";
import { Row, Col } from "antd";
import { maxLength, number, numberWithUnitCode, required } from "@common/utils/Validate";
import { getDropdownNoticeOfWorkUnitTypeOptions } from "@common/selectors/staticContentSelectors";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderFieldWithDropdown from "@/components/common/RenderFieldWithDropdown";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";
import CustomPropTypes from "@/customPropTypes";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  unitTypeOptions: CustomPropTypes.options.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
};

export const SandGravelQuarry = (props) => {
  return (
    <div>
      <h4>Soil Conservation</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Average Depth Overburden
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_and_gravel.average_overburden_depth").value
              }
              isVisible={
                props.renderOriginalValues("sand_and_gravel.average_overburden_depth").edited
              }
            />
          </div>
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
          <div className="field-title">
            Average Depth of topsoil
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_and_gravel.average_top_soil_depth").value
              }
              isVisible={
                props.renderOriginalValues("sand_and_gravel.average_top_soil_depth").edited
              }
            />
          </div>
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
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_and_gravel.stability_measures_description").value
              }
              isVisible={
                props.renderOriginalValues("sand_and_gravel.stability_measures_description").edited
              }
            />
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
          <div className="field-title">
            Is this site within the Agricultural Land Reserve?
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_and_gravel.is_agricultural_land_reserve").value
              }
              isVisible={
                props.renderOriginalValues("sand_and_gravel.is_agricultural_land_reserve").edited
              }
            />
          </div>
          <Field
            id="is_agricultural_land_reserve"
            name="is_agricultural_land_reserve"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Current land use zoning for the site
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("sand_and_gravel.land_use_zoning").value}
              isVisible={props.renderOriginalValues("sand_and_gravel.land_use_zoning").edited}
            />
          </div>
          <Field
            id="land_use_zoning"
            name="land_use_zoning"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title--light">
            Permit Application Number
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues(
                  "sand_and_gravel.agri_lnd_rsrv_permit_application_number"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_and_gravel.agri_lnd_rsrv_permit_application_number"
                ).edited
              }
            />
          </div>
          <Field
            id="agri_lnd_rsrv_permit_application_number"
            name="agri_lnd_rsrv_permit_application_number"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed land use
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("sand_and_gravel.proposed_land_use").value}
              isVisible={props.renderOriginalValues("sand_and_gravel.proposed_land_use").edited}
            />
          </div>
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
          <div className="field-title">
            Official community plan for the site
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("sand_and_gravel.community_plan").value}
              isVisible={props.renderOriginalValues("sand_and_gravel.community_plan").edited}
            />
          </div>
          <Field
            id="community_plan"
            name="community_plan"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Does the local government have a soil removal bylaw?
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_and_gravel.has_local_soil_removal_bylaw").value
              }
              isVisible={
                props.renderOriginalValues("sand_and_gravel.has_local_soil_removal_bylaw").edited
              }
            />
          </div>
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
          <div className="field-title">
            Total mineable reserves over the life of the mine
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_and_gravel.total_mineable_reserves").value
              }
              isVisible={
                props.renderOriginalValues("sand_and_gravel.total_mineable_reserves").edited
              }
            />
          </div>
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
          <div className="field-title">
            Annual extraction from site
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_and_gravel.total_annual_extraction").value
              }
              isVisible={
                props.renderOriginalValues("sand_and_gravel.total_annual_extraction").edited
              }
            />
          </div>
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
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="details"
        fieldID="activity_detail_id"
        tableContent={[
          {
            title: "Activity",
            value: "activity_type_description",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: [required],
          },
          {
            title: "Disturbed Area (ha)",
            value: "disturbed_area",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Merchantable timber volume (m³)",
            value: "timber_volume",
            component: RenderField,
            validate: [number],
          },
        ]}
      />
      <br />
      <Equipment isViewMode={props.isViewMode} />
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_and_gravel.reclamation_description").value
              }
              isVisible={
                props.renderOriginalValues("sand_and_gravel.reclamation_description").edited
              }
            />
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
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("sand_and_gravel.reclamation_cost").value}
              isVisible={props.renderOriginalValues("sand_and_gravel.reclamation_cost").edited}
            />
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

SandGravelQuarry.propTypes = propTypes;

export default connect(
  (state) => ({
    unitTypeOptions: getDropdownNoticeOfWorkUnitTypeOptions(state),
  }),
  null
)(SandGravelQuarry);
