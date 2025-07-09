import React, { FC, useEffect, useMemo, useState } from "react";
import { IPermitCondition } from "@mds/common/interfaces/permits/permitCondition.interface";
import SubConditionForm from "@mds/common/components/permits/SubConditionForm";
import { IGroupedDropdownList } from "@mds/common/interfaces/common/option.interface";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import { Typography } from "antd";
import { usePermitConditions } from "@mds/common/components/permits/PermitConditionsContext";
import PermitConditionForm from "@mds/common/components/permits/PermitConditionForm";
import PermitConditionReportRequirements from "@mds/common/components/permits/PermitConditionReportRequirements";
import { PermitConditionStatus } from "./PermitConditionStatus";
import { getReportRequirementsByCondition } from "@mds/common/redux/selectors/permitSelectors";
import { useAppSelector } from "@mds/common/redux/rootState";
import { FORM } from "@mds/common/constants/forms";

const { Title } = Typography;

interface PermitConditionLayerProps {
  isExtracted: boolean;
  condition: IPermitCondition;
  level?: number;
  isExpanded?: boolean;
  setParentExpand?: () => void;
  canEditPermitConditions?: boolean;
  setEditingFormName: (formName: string) => void;
  editingFormName: string;
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
  setEditingFormName,
  editingFormName,
  handleMoveCondition,
  currentPosition,
  conditionCount,
  permitAmendmentGuid,
  refreshData,
  categoryOptions,
}) => {
  const { loading, previousAmendment, permitGuid } = usePermitConditions();
  const requirements = useAppSelector(
    getReportRequirementsByCondition(permitGuid, permitAmendmentGuid, condition.permit_condition_id)
  );
  const editingCondition = useMemo(
    () => editingFormName === `${FORM.EDIT_PERMIT_CONDITION}_${condition.permit_condition_id}_${condition.condition_category_code}`,
    [condition.permit_condition_guid, editingFormName]
  );
  const [isAddingListItem, setIsAddingListItem] = useState<boolean>(false);
  const [expandClass, setExpandClass] = useState(
    isExpanded ? "condition-expanded" : "condition-collapsed"
  );
  const loadClassName = level === 0 && loading ? " condition-layer--loading" : "";
  const className = `condition-layer condition-layer--${level}${loadClassName} condition-${condition.condition_type_code} fade-in`;
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

  let matchingCondition = null;
  if (level === 0) {
    // Find the matching condition in the previous amendment
    matchingCondition = previousAmendment?.conditions.find((c) => {
      return (
        !c.parent_permit_condition_id &&
        c.step === condition.step &&
        c.condition === condition.condition
      );
    });
  }

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
          setEditingFormName={setEditingFormName}
          editingFormName={editingFormName}
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
                setEditingFormName={setEditingFormName}
                editingFormName={editingFormName}
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
        <div>
          {!condition?.parent_permit_condition_id && requirements.length > 0 && (
            <div className="report-collapse-container">
              <Title level={4} className="primary-colour">
                Report Requirements
              </Title>

              <PermitConditionReportRequirements
                requirements={requirements}
                refreshData={refreshData}
                canEditPermitConditions={canEditPermitConditions}
              />
            </div>
          )}
          <PermitConditionStatus
            condition={condition}
            previousCondition={matchingCondition}
            canEditPermitConditions={canEditPermitConditions}
            isDisabled={isAddingListItem}
            permitAmendmentGuid={permitAmendmentGuid}
            requirements={requirements}
            refreshData={refreshData}
          />
        </div>
      )}
      {/* Content added here will show up at the top level when conditions are collapsed */}
    </div>
  );
};

export default React.memo(PermitConditionLayer);
