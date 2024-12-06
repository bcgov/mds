import React, { FC, useEffect, useState } from "react";
import { IPermitCondition } from "@mds/common/interfaces/permits/permitCondition.interface";
import PermitConditionForm from "./PermitConditionForm";

interface PermitConditionLayerProps {
  condition: IPermitCondition;
  level?: number;
  isExpanded?: boolean;
  setParentExpand?: () => void;
  canEditPermitConditions?: boolean;
  setEditingConditionGuid: (permit_condition_guid: string) => void;
  editingConditionGuid: string;
  handleMoveCondition: (condition: IPermitCondition, newOrder: number) => Promise<void>;
  currentPosition: number;
  conditionCount: number;
  permitAmendmentGuid: string;
}

const PermitConditionLayer: FC<PermitConditionLayerProps> = ({
  condition,
  isExpanded,
  level = 0,
  setParentExpand = () => { },
  canEditPermitConditions = false,
  setEditingConditionGuid,
  editingConditionGuid,
  handleMoveCondition,
  currentPosition,
  conditionCount,
  permitAmendmentGuid,
}) => {
  const editingCondition = editingConditionGuid === condition.permit_condition_guid;
  const [expandClass, setExpandClass] = useState(
    isExpanded ? "condition-expanded" : "condition-collapsed"
  );
  const className = `condition-layer condition-layer--${level} condition-${condition.condition_type_code} fade-in`;

  const handleSetParentExpand = () => {
    if ((level === 0)) {
      return;
    } else {
      setExpandClass("condition-expanded");
      setParentExpand();
    }
  };

  useEffect(() => {
    setExpandClass(isExpanded || editingCondition ? "condition-expanded" : "condition-collapsed");
  }, [isExpanded]);

  const handleSectionClick = (event) => {
    if (canEditPermitConditions) {
      event.stopPropagation();
      setParentExpand();
    }
  };

  const moveUp = async (condition: IPermitCondition) => {
    await handleMoveCondition(condition, currentPosition - 1);
  }

  const moveDown = async (condition: IPermitCondition) => {
    await handleMoveCondition(condition, currentPosition + 1);
  }

  return (
    <div
      className={`${className} ${editingCondition ? "condition-layer--editing" : ""}`}
      onClick={handleSectionClick}
      onKeyPress={handleSectionClick}
    >
      <div className={expandClass}>
        <PermitConditionForm
          onEdit={setParentExpand}
          condition={condition}
          canEditPermitConditions={canEditPermitConditions}
          setEditingConditionGuid={setEditingConditionGuid}
          editingConditionGuid={editingConditionGuid}
          moveUp={currentPosition > 0 && moveUp}
          moveDown={currentPosition < conditionCount - 1 && moveDown}
          permitAmendmentGuid={permitAmendmentGuid}
        />
        {condition?.sub_conditions?.map((subCondition, idx) => {
          return (
            <div key={subCondition.permit_condition_id}>
              <PermitConditionLayer
                permitAmendmentGuid={permitAmendmentGuid}
                condition={subCondition}
                level={level + 1}
                setParentExpand={handleSetParentExpand}
                canEditPermitConditions={canEditPermitConditions}
                setEditingConditionGuid={setEditingConditionGuid}
                editingConditionGuid={editingConditionGuid}
                handleMoveCondition={handleMoveCondition}
                currentPosition={idx}
                conditionCount={condition.sub_conditions.length}
              />
            </div>
          );
        })}
      </div>
      {/* Content added here will show up at the top level when conditions are collapsed */}
    </div>
  );
};

export default PermitConditionLayer;
