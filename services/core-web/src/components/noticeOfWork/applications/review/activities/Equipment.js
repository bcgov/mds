import React from "react";
import { PropTypes } from "prop-types";
import RenderField from "@/components/common/RenderField";
import { number } from "@common/utils/Validate";
import CoreEditableTable from "@/components/common/CoreEditableTable";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
};

export const Equipment = (props) => {
  return (
    <div>
      <h4>Equipment</h4>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="equipment"
        type="Equipment"
        fieldID="equipment_id"
        tableContent={[
          {
            title: "Quantity",
            value: "quantity",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Description",
            value: "description",
            component: RenderField,
          },
          {
            title: "Capacity",
            value: "capacity",
            component: RenderField,
          },
        ]}
      />
      <br />
    </div>
  );
};

Equipment.propTypes = propTypes;

export default Equipment;
