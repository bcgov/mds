import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { connect } from "react-redux";
import { Row, Col } from "antd";
import { maxLength, number, required } from "@common/utils/Validate";
import RenderField from "@/components/common/RenderField";
import { getDropdownNoticeOfWorkUnitTypeOptions } from "@common/selectors/staticContentSelectors";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderSelect from "@/components/common/RenderSelect";
import CustomPropTypes from "@/customPropTypes";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import { NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
  unitTypeOptions: CustomPropTypes.options.isRequired,
};

export const WaterSupply = (props) => {
  return (
    <div>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="details"
        fieldID="activity_detail_id"
        tableContent={[
          {
            title: "Source",
            value: "supply_source_description",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: [required],
          },
          {
            title: "Activity",
            value: "supply_source_type",
            component: RenderAutoSizeField,
            minRows: 1,
          },
          {
            title: "Water Use",
            value: "water_use_description",
            component: RenderAutoSizeField,
            minRows: 1,
          },
          {
            title: "Pump Size (in)",
            value: "pump_size",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Intake Location",
            value: "intake_location",
            component: RenderAutoSizeField,
          },
          {
            title: "Estimate Rate",
            value: "estimate_rate",
            component: RenderField,
            validate: [number],
            hasUnit: true,
          },
          {
            title: "Estimate Rate Unit",
            value: "estimate_rate_unit_type_code",
            component: RenderSelect,
            data: props.unitTypeOptions.filter(({ value }) => value === "MES" || value === "MED"),
            validate: [required],
            isUnit: true,
          },
        ]}
      />
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("water_supply.reclamation_description").value
              }
              isVisible={props.renderOriginalValues("water_supply.reclamation_description").edited}
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
              originalValue={props.renderOriginalValues("water_supply.reclamation_cost").value}
              isVisible={props.renderOriginalValues("water_supply.reclamation_cost").edited}
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

WaterSupply.propTypes = propTypes;

export default connect(
  (state) => ({
    unitTypeOptions: getDropdownNoticeOfWorkUnitTypeOptions(state),
  }),
  null
)(WaterSupply);
