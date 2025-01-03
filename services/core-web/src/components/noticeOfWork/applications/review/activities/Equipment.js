import React from "react";
import { PropTypes } from "prop-types";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import { number } from "@mds/common/redux/utils/Validate";
import CoreEditableTable from "@/components/common/CoreEditableTable";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
};

export const Equipment = (props) => {
  return (
    <div>
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
            component: RenderAutoSizeField,
            minRows: 1,
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
