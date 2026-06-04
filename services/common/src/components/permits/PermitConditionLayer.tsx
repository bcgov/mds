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
import { IStandardPermitCondition } from "@mds/common/interfaces";
import { getStandardReportByCondition } from "@mds/common/redux/slices/mineReportPermitRequirementSlice";
import { containsConditionId } from "@mds/common/utils/helpers";

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
  handleMoveCondition: (condition: IPermitCondition | IStandardPermitCondition, isMoveUp: boolean) => Promise<void>;
  currentPosition: number;
  conditionCount: number;
  permitAmendmentGuid: string;
  refreshData: (closeForm?: boolean) => Promise<void>;
  conditionSelected?: (condition: IPermitCondition) => void;
  categoryOptions?: IGroupedDropdownList[];
  isInsideActiveCondition?: boolean;
  isInsideSubmittingCondition?: boolean;
  siblingIds?: number[];
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
  isInsideActiveCondition = false,
  isInsideSubmittingCondition = false,
  siblingIds = [],
}) => {
  const { loading,
    previousAmendment,
    permitGuid,
    standardConditionType,
    isNowEditor,
    isStandardConditionEditor,
    activeConditionId,
    setActiveConditionId,
    clearActiveConditionId,
    submittingConditionIds,
    setLoading,
    addSubmittingCondition,
    removeSubmittingCondition,
  } = usePermitConditions();
  const permitRequirements = useAppSelector(
    getReportRequirementsByCondition(permitGuid, permitAmendmentGuid, condition.permit_condition_id, isNowEditor)
  );
  const standardId = standardConditionType ? condition.permit_condition_id : undefined;
  const standardRequirements = useAppSelector(getStandardReportByCondition(standardId));
  const requirements = isStandardConditionEditor ? standardRequirements : permitRequirements;

  const editingCondition = useMemo(
    () => editingFormName === `${FORM.EDIT_PERMIT_CONDITION}_${condition.permit_condition_id}_${condition.condition_category_code}`,
    [condition.permit_condition_guid, editingFormName]
  );
  const [isAddingListItem, setIsAddingListItem] = useState<boolean>(false);
  const [expandClass, setExpandClass] = useState(
    isExpanded ? "condition-expanded" : "condition-collapsed"
  );

  const isActiveCondition = !!(activeConditionId && condition.permit_condition_id === activeConditionId);
  const isAncestorOfActive = !!(activeConditionId && !isActiveCondition && !isInsideActiveCondition &&
    containsConditionId(condition.sub_conditions ?? [], activeConditionId));
  const isConditionSubmitting = submittingConditionIds.includes(condition.permit_condition_id);
  const loadClassName = loading && (isConditionSubmitting || isInsideSubmittingCondition)
    ? " condition-layer--loading" : "";
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
    event.stopPropagation();
    if (canEditPermitConditions) {
      setParentExpand();
    }

    if (conditionSelected) {
      conditionSelected(condition);
    }
  };

  const handleSaveListItem = async () => {
    await refreshData();
    setIsAddingListItem(false);
    clearActiveConditionId(condition.permit_condition_id);
  };

  const handleMove = async (condition: IPermitCondition | IStandardPermitCondition, isMoveUp: boolean) => {
    siblingIds.forEach(id => addSubmittingCondition(id));
    setLoading(true);
    await handleMoveCondition(condition, isMoveUp);
    siblingIds.forEach(id => removeSubmittingCondition(id));
    setLoading(false);
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
          moveUp={currentPosition > 0 ? (c) => handleMove(c, true) : undefined}
          moveDown={currentPosition < conditionCount - 1 ? (c) => handleMove(c, false) : undefined}
          permitAmendmentGuid={permitAmendmentGuid}
          refreshData={refreshData}
          setIsAddingListItem={setIsAddingListItem}
          isAddingListItem={isAddingListItem}
          categoryOptions={categoryOptions}
          isSubmittingConditionFamily={isConditionSubmitting || isInsideSubmittingCondition}
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
                isInsideActiveCondition={isInsideActiveCondition || isActiveCondition}
                isInsideSubmittingCondition={isInsideSubmittingCondition || isConditionSubmitting}
                siblingIds={condition.sub_conditions.map(sc => sc.permit_condition_id)}
              />
            </div>
          );
        })}
      </div>
      {isAddingListItem && (
        <SubConditionForm
          level={level + 1}
          parentCondition={condition}
          handleCancel={() => {
            setIsAddingListItem(false);
            setActiveConditionId(null);
          }}
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
                conditionId={condition.permit_condition_id}
                conditionFamilyLoading={
                  loading && (
                    isAncestorOfActive ||
                    submittingConditionIds.some((id) =>
                      id === condition.permit_condition_id ||
                      containsConditionId(condition.sub_conditions ?? [], id)
                    )
                  )
                }
              />
            </div>
          )}
          {!isStandardConditionEditor && !isNowEditor && <PermitConditionStatus
            condition={condition}
            previousCondition={matchingCondition}
            canEditPermitConditions={canEditPermitConditions}
            isDisabled={isAddingListItem || isConditionSubmitting}
            permitAmendmentGuid={permitAmendmentGuid}
            requirements={requirements}
            refreshData={refreshData}
          />}
        </div>
      )}
      {/* Content added here will show up at the top level when conditions are collapsed */}
    </div>
  );
};

export default React.memo(PermitConditionLayer);
