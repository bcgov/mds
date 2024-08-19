import React, { FC } from "react";
import { IPermitCondition } from "@mds/common/interfaces/permits/permitCondition.interface";

interface PermitConditionLayerProps {
  condition: IPermitCondition;
  level?: number;
  isExpanded?: boolean;
}

const PermitConditionLayer: FC<PermitConditionLayerProps> = ({
  condition,
  isExpanded,
  level = 0,
}) => {
  const expandClass = isExpanded ? "condition-expanded" : "condition-collapsed";
  const className = `condition-layer condition-layer--${level} condition-${condition.condition_type_code} fade-in`;
  return (
    <div className={className}>
      <div className={expandClass}>
        <p className={className}>
          {condition.step} {condition.condition}
        </p>
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
      {/* Content added here will show up at the top level when conditions are collapsed */}
    </div>
  );
};

export default PermitConditionLayer;
