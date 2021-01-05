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
import CustomPropTypes from "@/customPropTypes";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  unitTypeOptions: CustomPropTypes.options.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  undergroundExplorationTypeOptions: CustomPropTypes.options.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
};

export const UndergroundExploration = (props) => {
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
            title: "Width(m)",
            value: "width",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Length(km)",
            value: "length",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Height(m)",
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
            title: "Merchantable timber volume (m3)",
            value: "timber_volume",
            component: RenderField,
            validate: [number],
          },
        ]}
      />
      <br />
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed Activities
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("underground_exploration.proposed_activity").value
              }
              isVisible={
                props.renderOriginalValues("underground_exploration.proposed_activity").edited
              }
            />
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
            data={props.unitTypeOptions}
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
            data={props.unitTypeOptions}
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
