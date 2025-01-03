import React from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { number, required } from "@mds/common/redux/utils/Validate";
import RenderField from "@mds/common/components/forms/RenderField";
import { getDropdownNoticeOfWorkUnitTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import CustomPropTypes from "@/customPropTypes";
import CoreEditableTable from "@/components/common/CoreEditableTable";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  unitTypeOptions: CustomPropTypes.options.isRequired,
};

export const WaterSupply = (props) => {
  return (
    <div>
      <h4>Source of Water</h4>
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
