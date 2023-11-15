import React from "react";
import { PropTypes } from "prop-types";
import { Field, Fields, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { Row, Col } from "antd";
import { currencyMask } from "@common/utils/helpers";
import { maxLength, number, numberWithUnitCode, required } from "@common/utils/Validate";
import { getDropdownNoticeOfWorkUnitTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderFieldWithDropdown from "@/components/common/RenderFieldWithDropdown";
import RenderCheckbox from "@/components/common/RenderCheckbox";
import CustomPropTypes from "@/customPropTypes";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
import * as FORM from "@/constants/forms";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  unitTypeOptions: CustomPropTypes.options.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(CustomPropTypes.blasting).isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
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
                props.renderOriginalValues("sand_gravel_quarry_operation.average_overburden_depth")
                  .value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.average_overburden_depth")
                  .edited
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
                props.renderOriginalValues("sand_gravel_quarry_operation.average_top_soil_depth")
                  .value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.average_top_soil_depth")
                  .edited
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
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.stability_measures_description"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.stability_measures_description"
                ).edited
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
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.is_agricultural_land_reserve"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.is_agricultural_land_reserve"
                ).edited
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
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.land_use_zoning").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.land_use_zoning").edited
              }
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
                  "sand_gravel_quarry_operation.agri_lnd_rsrv_permit_application_number"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.agri_lnd_rsrv_permit_application_number"
                ).edited
              }
            />
          </div>
          <Field
            id="agri_lnd_rsrv_permit_application_number"
            name="agri_lnd_rsrv_permit_application_number"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed land use
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.proposed_land_use").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.proposed_land_use").edited
              }
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
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.community_plan").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.community_plan").edited
              }
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
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.has_local_soil_removal_bylaw"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.has_local_soil_removal_bylaw"
                ).edited
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
                props.renderOriginalValues("sand_gravel_quarry_operation.total_mineable_reserves")
                  .value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.total_mineable_reserves")
                  .edited
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
                props.renderOriginalValues("sand_gravel_quarry_operation.total_annual_extraction")
                  .value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.total_annual_extraction")
                  .edited
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
      <h4>Activities</h4>
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
      <Row gutter={16}>
        <Col md={18} sm={24}>
          <div className="field-title">
            Is the work year round or only seasonal?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.work_year_info").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.work_year_info").edited
              }
              style={{ marginLeft: "5px" }}
            />
          </div>
          <Field
            id="work_year_info"
            name="work_year_info"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            customOptions={[
              { label: "Year round", value: "Year round" },
              { label: "Seasonal", value: "Seasonal" },
              { label: "Intermittent", value: "Intermittent" },
            ]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Brief description of operation, including proposed work schedule
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.proposed_activity_description"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.proposed_activity_description"
                ).edited
              }
            />
          </div>
          <Field
            id="proposed_activity_description"
            name="proposed_activity_description"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
      </Row>
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.reclamation_description")
                  .value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.reclamation_description")
                  .edited
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
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.reclamation_cost").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.reclamation_cost").edited
              }
            />
          </div>
          <Field
            id="reclamation_cost"
            name="reclamation_cost"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[number]}
            {...currencyMask}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            If backfilling of pits or pit slopes is proposed in the final configuration for
            reclamation, details of materials to be used and placement procedures
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.reclamation_backfill_detail"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.reclamation_backfill_detail"
                ).edited
              }
            />
          </div>
          <Field
            id="reclamation_backfill_detail"
            name="reclamation_backfill_detail"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Will progressive reclamation be carried out?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.progressive_reclamation")
                  .value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.progressive_reclamation")
                  .edited
              }
            />
          </div>
          <Field
            id="progressive_reclamation"
            name="progressive_reclamation"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Maximum unreclaimed disturbance at any given time
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.max_unreclaimed").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.max_unreclaimed").edited
              }
            />
          </div>
          <Fields
            names={["max_unreclaimed", "max_unreclaimed_unit_type_code"]}
            id="max_unreclaimed"
            dropdownID="max_unreclaimed_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
          />
        </Col>
      </Row>

      <br />
      <br />
      <h4>Groundwater Protection</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Average depth to the high groundwater table at the proposed excavation
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.average_groundwater_depth")
                  .value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.average_groundwater_depth")
                  .edited
              }
            />
          </div>
          <Fields
            names={["average_groundwater_depth", "average_groundwater_depth_unit_type_code"]}
            id="average_groundwater_depth"
            dropdownID="average_groundwater_depth_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Elevation of the groundwater table was determined from
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <Field
              id="has_groundwater_from_existing_area"
              name="has_groundwater_from_existing_area"
              label={
                <>
                  Existing area wells
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues(
                        "sand_gravel_quarry_operation.has_groundwater_from_existing_area"
                      ).value
                    }
                    isVisible={
                      props.renderOriginalValues(
                        "sand_gravel_quarry_operation.has_groundwater_from_existing_area"
                      ).edited
                    }
                    style={{ marginLeft: "5px" }}
                  />
                </>
              }
              type="checkbox"
              disabled={props.isViewMode}
              component={RenderCheckbox}
            />
            <Field
              id="has_groundwater_from_test_pits"
              name="has_groundwater_from_test_pits"
              label={
                <>
                  Test pits
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues(
                        "sand_gravel_quarry_operation.has_groundwater_from_test_pits"
                      ).value
                    }
                    isVisible={
                      props.renderOriginalValues(
                        "sand_gravel_quarry_operation.has_groundwater_from_test_pits"
                      ).edited
                    }
                    style={{ marginLeft: "5px" }}
                  />
                </>
              }
              type="checkbox"
              disabled={props.isViewMode}
              component={RenderCheckbox}
            />
            <Field
              id="has_groundwater_from_test_wells"
              name="has_groundwater_from_test_wells"
              label={
                <>
                  Test wells drilled for this purpose
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues(
                        "sand_gravel_quarry_operation.has_groundwater_from_test_wells"
                      ).value
                    }
                    isVisible={
                      props.renderOriginalValues(
                        "sand_gravel_quarry_operation.has_groundwater_from_test_wells"
                      ).edited
                    }
                    style={{ marginLeft: "5px" }}
                  />
                </>
              }
              type="checkbox"
              disabled={props.isViewMode}
              component={RenderCheckbox}
            />
            <Field
              id="has_ground_water_from_other"
              name="has_ground_water_from_other"
              label={
                <>
                  Other
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues(
                        "sand_gravel_quarry_operation.has_ground_water_from_other"
                      ).value
                    }
                    isVisible={
                      props.renderOriginalValues(
                        "sand_gravel_quarry_operation.has_ground_water_from_other"
                      ).edited
                    }
                    style={{ marginLeft: "5px" }}
                  />
                </>
              }
              type="checkbox"
              disabled={props.isViewMode}
              component={RenderCheckbox}
            />
            <Field
              id="groundwater_from_other_description"
              name="groundwater_from_other_description"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
              validate={[maxLength(4000)]}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Measures proposed to protect groundwater from potential impacts of the proposed mining
            activity
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.groundwater_protection_plan"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.groundwater_protection_plan"
                ).edited
              }
            />
          </div>
          <Field
            id="groundwater_protection_plan"
            name="groundwater_protection_plan"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
      </Row>

      <br />
      <h4>Impact Minimization</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Shortest Distance between proposed excavation to nearest residence
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.nearest_residence_distance"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.nearest_residence_distance"
                ).edited
              }
            />
          </div>
          <Fields
            names={["nearest_residence_distance", "nearest_residence_distance_unit_type_code"]}
            id="nearest_residence_distance"
            dropdownID="nearest_residence_distance_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Shortest distance between proposed excavation to nearest residential water source
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.nearest_water_source_distance"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "sand_gravel_quarry_operation.nearest_water_source_distance"
                ).edited
              }
            />
          </div>
          <Fields
            names={[
              "nearest_water_source_distance",
              "nearest_water_source_distance_unit_type_code",
            ]}
            id="nearest_water_source_distance"
            dropdownID="nearest_water_source_distance_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={props.unitTypeOptions}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Measures proposed to prevent inadvertent access of unauthorized persons to the mine site
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.secure_access_plan").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.secure_access_plan").edited
              }
            />
          </div>
          <Field
            id="secure_access_plan"
            name="secure_access_plan"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Measures proposed to minimize noise impacts of the operation
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.noise_impact_plan").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.noise_impact_plan").edited
              }
            />
          </div>
          <Field
            id="noise_impact_plan"
            name="noise_impact_plan"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Measures proposed to minimize the dust impacts of the operation
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.dust_impact_plan").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.dust_impact_plan").edited
              }
            />
          </div>
          <Field
            id="dust_impact_plan"
            name="dust_impact_plan"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Measures proposed to minimize visual impacts of the operation
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("sand_gravel_quarry_operation.visual_impact_plan").value
              }
              isVisible={
                props.renderOriginalValues("sand_gravel_quarry_operation.visual_impact_plan").edited
              }
            />
          </div>
          <Field
            id="visual_impact_plan"
            name="visual_impact_plan"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
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
    formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state).sand_gravel_quarry_operation || {},
  }),
  null
)(SandGravelQuarry);
