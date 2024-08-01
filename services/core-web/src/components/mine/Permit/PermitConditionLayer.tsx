import React, { FC } from "react";
import { IPermitCondition } from "@mds/common";

interface PermitConditionLayerProps {
  condition: IPermitCondition;
  level?: number;
}

const PermitConditionLayer: FC<PermitConditionLayerProps> = ({ condition, level = 0 }) => {
  return (
    <div
      className={`condition-layer-${level}`}
      style={{ border: "1px solid deeppink", padding: "10px" }}
    >
      <p>{condition.condition}</p>
      {condition?.sub_conditions?.map((condition) => {
        return (
          <PermitConditionLayer
            condition={condition}
            key={condition.permit_condition_id}
            level={level + 1}
          />
        );
      })}
    </div>
  );
};

export default PermitConditionLayer;
