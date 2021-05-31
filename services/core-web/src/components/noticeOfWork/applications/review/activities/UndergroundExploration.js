import React from "react";
import { PropTypes } from "prop-types";
import { Field, Fields } from "redux-form";
import { connect } from "react-redux";
import { Row, Col } from "antd";
import {
  getDropdownNoticeOfWorkUndergroundExplorationTypeOptions,
  getDropdownNoticeOfWorkUnitTypeOptions,
} from "@common/selectors/staticContentSelectors";
import {
  numberWithUnitCode,
  required,
  number,
  validateSelectOptions,
} from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderSelect from "@/components/common/RenderSelect";
import RenderFieldWithDropdown from "@/components/common/RenderFieldWithDropdown";
import RenderCheckbox from "@/components/common/RenderCheckbox";
import CustomPropTypes from "@/customPropTypes";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  unitTypeOptions: CustomPropTypes.options.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  undergroundExplorationTypeOptions: CustomPropTypes.options.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
};

export const UndergroundExploration = (props) => {
  const acceptableUnits = props.unitTypeOptions.filter(
    ({ value }) => value === "MEC" || value === "MTN"
  );
  return (
    <div>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="details"
        fieldID="activity_detail_id"
        tableContent={[
          {
            title: "Exploration Type",
            value: "underground_exploration_type_code",
            component: RenderSelect,
            validate: [required, validateSelectOptions(props.undergroundExplorationTypeOptions)],
            data: props.undergroundExplorationTypeOptions,
          },
          {
            title: "Activity",
            value: "activity_type_description",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: [required],
          },
          {
            title: "Quantity",
            value: "quantity",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Incline",
            value: "incline",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Width (m)",
            value: "width",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Length (m)",
            value: "length",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Height (m)",
            value: "height",
            component: RenderField,
            validate: [number],
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
        <div className="field-title">
          Proposed Activities
          {props.isPreLaunch && <NOWFieldOriginTooltip />}
        </div>
        <Col sm={24}>
          <Field
            id="proposed_bulk_sample"
            name="proposed_bulk_sample"
            label={
              <>
                Bulk Sample
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("underground_exploration.total_waste_amount").value
                  }
                  isVisible={
                    props.renderOriginalValues("underground_exploration.total_waste_amount").edited
                  }
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="proposed_de_watering"
            name="proposed_de_watering"
            label={
              <>
                De-watering
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("underground_exploration.proposed_de_watering").value
                  }
                  isVisible={
                    props.renderOriginalValues("underground_exploration.proposed_de_watering")
                      .edited
                  }
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="proposed_diamond_drilling"
            name="proposed_diamond_drilling"
            label="Diamond Drilling"
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="proposed_mapping_chip_sampling"
            name="proposed_mapping_chip_sampling"
            label="Mapping / Chip Sampling"
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="proposed_new_development"
            name="proposed_new_development"
            label="New Development"
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="proposed_rehab"
            name="proposed_rehab"
            label="Rehab"
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="proposed_underground_fuel_storage"
            name="proposed_underground_fuel_storage"
            label="Underground Fuel Storage"
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
      </Row>
      <br />
      <h4>New Underground Exploration Development</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Total Ore
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("underground_exploration.total_ore_amount").value
              }
              isVisible={
                props.renderOriginalValues("underground_exploration.total_ore_amount").edited
              }
            />
          </div>
          <Fields
            names={["total_ore_amount", "total_ore_unit_type_code"]}
            id="total_ore_amount"
            dropdownID="total_ore_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={acceptableUnits}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Total Waste
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("underground_exploration.total_waste_amount").value
              }
              isVisible={
                props.renderOriginalValues("underground_exploration.total_waste_amount").edited
              }
            />
          </div>
          <Fields
            names={["total_waste_amount", "total_waste_unit_type_code"]}
            id="total_waste_amount"
            dropdownID="total_waste_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={acceptableUnits}
          />
        </Col>
      </Row>
      <h4>Surface Disturbance</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Total Ore
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("underground_exploration.surface_total_ore_amount").value
              }
              isVisible={
                props.renderOriginalValues("underground_exploration.surface_total_ore_amount")
                  .edited
              }
            />
          </div>
          <Fields
            names={["surface_total_ore_amount", "surface_total_ore_unit_type_code"]}
            id="surface_total_ore_amount"
            dropdownID="surface_total_ore_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={acceptableUnits}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Total Waste
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("underground_exploration.surface_total_waste_amount")
                  .value
              }
              isVisible={
                props.renderOriginalValues("underground_exploration.surface_total_waste_amount")
                  .edited
              }
            />
          </div>
          <Fields
            names={["surface_total_waste_amount", "surface_total_waste_unit_type_code"]}
            id="surface_total_waste_amount"
            dropdownID="surface_total_waste_unit_type_code"
            component={RenderFieldWithDropdown}
            disabled={props.isViewMode}
            validate={[numberWithUnitCode]}
            data={acceptableUnits}
          />
        </Col>
      </Row>
    </div>
  );
};

UndergroundExploration.propTypes = propTypes;

export default connect(
  (state) => ({
    undergroundExplorationTypeOptions: getDropdownNoticeOfWorkUndergroundExplorationTypeOptions(
      state
    ),
    unitTypeOptions: getDropdownNoticeOfWorkUnitTypeOptions(state),
  }),
  null
)(UndergroundExploration);
