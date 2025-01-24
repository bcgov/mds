import React, { FC, useEffect, useState } from "react";
import { IPermitCondition } from "@mds/common/interfaces/permits/permitCondition.interface";
import PermitConditionForm from "./PermitConditionForm";
import SubConditionForm from "./SubConditionForm";
import { IGroupedDropdownList } from "@mds/common/interfaces/common/option.interface";
import { PermitConditionStatus } from "./PermitConditionStatus";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";

interface PermitConditionLayerProps {
  isExtracted: boolean;
  condition: IPermitCondition;
  level?: number;
  isExpanded?: boolean;
  setParentExpand?: () => void;
  canEditPermitConditions?: boolean;
  setEditingConditionGuid: (permit_condition_guid: string) => void;
  editingConditionGuid: string;
  handleMoveCondition: (condition: IPermitCondition, isMoveUp: boolean) => Promise<void>;
  currentPosition: number;
  conditionCount: number;
  permitAmendmentGuid: string;
  refreshData: () => Promise<void>;
  conditionSelected?: (condition: IPermitCondition) => void;
  categoryOptions?: IGroupedDropdownList[];
}

const PermitConditionLayer: FC<PermitConditionLayerProps> = ({
  isExtracted,
  condition,
  isExpanded,
  conditionSelected,
  level = 0,
  setParentExpand = () => { },
  canEditPermitConditions = false,
  setEditingConditionGuid,
  editingConditionGuid,
  handleMoveCondition,
  currentPosition,
  conditionCount,
  permitAmendmentGuid,
  refreshData,
  categoryOptions,
}) => {
  const editingCondition = editingConditionGuid === condition.permit_condition_guid;
  const [isAddingListItem, setIsAddingListItem] = useState<boolean>(false);
  const [expandClass, setExpandClass] = useState(
    isExpanded ? "condition-expanded" : "condition-collapsed"
  );
  const className = `condition-layer condition-layer--${level} condition-${condition.condition_type_code} fade-in`;
  const { isFeatureEnabled } = useFeatureFlag();

  const handleSetParentExpand = () => {
    if (level === 0) {
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

    if (conditionSelected) {
      conditionSelected(condition);
    }
  };

  const handleSaveListItem = async () => {
    await refreshData();
    setIsAddingListItem(false);
  };

  const moveUp = async (condition: IPermitCondition) => {
    await handleMoveCondition(condition, true);
  };

  const moveDown = async (condition: IPermitCondition) => {
    await handleMoveCondition(condition, false);
  };

  return (
    <div
      className={`${className} ${editingCondition ? "condition-layer--editing" : ""}`}
      onClick={handleSectionClick}
      onKeyPress={handleSectionClick}
    >
      <div className={expandClass}>
        <PermitConditionForm
          isExtracted={isExtracted}
          onEdit={setParentExpand}
          condition={condition}
          canEditPermitConditions={canEditPermitConditions}
          setEditingConditionGuid={setEditingConditionGuid}
          editingConditionGuid={editingConditionGuid}
          moveUp={currentPosition > 0 ? moveUp : undefined}
          moveDown={currentPosition < conditionCount - 1 ? moveDown : undefined}
          permitAmendmentGuid={permitAmendmentGuid}
          refreshData={refreshData}
          setIsAddingListItem={setIsAddingListItem}
          isAddingListItem={isAddingListItem}
          categoryOptions={categoryOptions}
        />
        {condition?.sub_conditions?.map((subCondition, idx) => {
          return (
            <div key={subCondition.permit_condition_id}>
              <PermitConditionLayer
                isExtracted={isExtracted}
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
                refreshData={refreshData}
                conditionSelected={conditionSelected}
              />
            </div>
          );
        })}
      </div>
      {isAddingListItem && (
        <SubConditionForm
          level={level + 1}
          parentCondition={condition}
          handleCancel={() => setIsAddingListItem(false)}
          onSubmit={handleSaveListItem}
          permitAmendmentGuid={permitAmendmentGuid}
        />
      )}
      {level == 0 && isFeatureEnabled(Feature.MODIFY_PERMIT_CONDITIONS) && (
        <PermitConditionStatus
          condition={condition}
          canEditPermitConditions={canEditPermitConditions}
          isDisabled={isAddingListItem || isExpanded}
          permitAmendmentGuid={permitAmendmentGuid}
          refreshData={refreshData}
        />
      )}
      {/* Content added here will show up at the top level when conditions are collapsed */}
    </div>
  );
};

export default PermitConditionLayer;
