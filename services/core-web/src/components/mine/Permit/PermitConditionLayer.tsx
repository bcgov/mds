import React, { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { IPermitCondition } from "@mds/common/interfaces/permits/permitCondition.interface";
import { Button, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faClipboard,
  faLink,
  faPlus,
  faTrashCan,
  faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { useParams } from "react-router-dom";
import { AddRequestToPermitConditionForm } from "../../Forms/reports/AddReporttoPermitConditionForm";
import { createMineReport } from "@mds/common/redux/actionCreators/reportActionCreator";

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
  const dispatch = useDispatch();
  const { id: mineGuid, permitGuid } = useParams<{ id: string; permitGuid: string }>();

  const [isEditMode, setIsEditMode] = useState<{
    [conditionId: string]: boolean;
  }>({});
  const [expandClass, setExpandClass] = useState(
    isExpanded ? "condition-expanded" : "condition-collapsed"
  );
  const className = `condition-layer condition-layer--${level} condition-${condition.condition_type_code} fade-in`;
  const editingCondition = isEditMode[condition.permit_condition_id];

  useEffect(() => {
    setExpandClass(isExpanded || editingCondition ? "condition-expanded" : "condition-collapsed");
  }, [isExpanded, isEditMode]);

  const handleSectionClick = (conditionId: number) => {
    setIsEditMode((prev) => ({
      ...prev,
      [conditionId]: true,
    }));
  };

  const closeEdit = (conditionId: number) => {
    setIsEditMode((prev) => ({
      ...prev,
      [conditionId]: false,
    }));
  };

  const addNewReport = async (values) => {
    await dispatch(createMineReport(mineGuid, values));
    dispatch(closeModal());
  };

  const handleOpenAddReportModal = (event, reportCondition: IPermitCondition) => {
    event.stopPropagation();
    dispatch(
      openModal({
        props: {
          onSubmit: addNewReport,
          title: `Add Permit Required Report to Condition`,
          condition: reportCondition,
          permitGuid,
        },
        content: AddRequestToPermitConditionForm,
      })
    );
  };

  return (
    <div
      className={`${className} ${editingCondition ? "condition-layer--editing" : ""}`}
      onClick={() => {
        handleSectionClick(condition.permit_condition_id);
      }}
    >
      <div className={expandClass}>
        <p>
          {condition.step} {condition.condition}
        </p>
        {condition?.sub_conditions?.map((subCondition) => {
          const sectionEdit = isEditMode[subCondition.permit_condition_id] || false;
          return (
            <div
              key={subCondition.permit_condition_id}
              onClick={() => handleSectionClick(subCondition.permit_condition_id)}
            >
              <PermitConditionLayer condition={subCondition} level={level + 1} />
              {sectionEdit && (
                <Row justify="space-between">
                  <Row gutter={8} className="condition-edit-buttons" align="middle">
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        console.log("Not yet implemented");
                      }}
                      type="default"
                      icon={<FontAwesomeIcon icon={faPlus} className="margin-medium--right" />}
                    >
                      List Item
                    </Button>
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        console.log("Not yet implemented");
                      }}
                      icon={<FontAwesomeIcon icon={faLink} className="margin-medium--right" />}
                      type="default"
                    >
                      Link Document
                    </Button>
                    <Button
                      onClick={(event) => {
                        handleOpenAddReportModal(event, subCondition);
                      }}
                      icon={<FontAwesomeIcon icon={faClipboard} className="margin-medium--right" />}
                      type="default"
                    >
                      Add Report
                    </Button>
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        closeEdit(subCondition.permit_condition_id);
                      }}
                      type="primary"
                      icon={<FontAwesomeIcon icon={faXmark} />}
                    />
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        console.log("Not yet implemented");
                      }}
                      type="primary"
                      icon={<FontAwesomeIcon icon={faCheck} />}
                    />
                  </Row>
                  <Row gutter={8} className="" align="middle">
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      type="default"
                      icon={<FontAwesomeIcon icon={faTrashCan} />}
                    />
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      type="default"
                      icon={<FontAwesomeIcon icon={faArrowUp} />}
                    />
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        console.log("Not yet implemented");
                      }}
                      type="default"
                      icon={<FontAwesomeIcon icon={faArrowDown} />}
                    />
                  </Row>
                </Row>
              )}
            </div>
          );
        })}
      </div>
      {/* Content added here will show up at the top level when conditions are collapsed */}
    </div>
  );
};

export default PermitConditionLayer;
