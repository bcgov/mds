import React, { FC } from "react";
import { IPermitCondition } from "@mds/common";

interface PermitConditionLayerProps {
  condition: IPermitCondition;
  level?: number;
  handleUpdateCondition?: (condition: IPermitCondition) => Promise<void>;
  isExpanded?: boolean;
}

const PermitConditionLayer: FC<PermitConditionLayerProps> = ({
  condition,
  handleUpdateCondition,
  isExpanded,
  level = 0,
}) => {
  const expandClass = isExpanded ? "condition-expanded" : "condition-collapsed";
  const className = `condition-layer condition-layer--${level} condition-${condition.condition_type_code} fade-in`;
  return (
    <div className={className}>
      <div className={expandClass}>
        <p>
          {condition.step} {condition.condition}
        </p>
        {condition?.sub_conditions?.map((condition) => {
          return (
            <PermitConditionLayer
              condition={condition}
              key={condition.permit_condition_id}
              level={level + 1}
              handleUpdateCondition={handleUpdateCondition}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PermitConditionLayer;
