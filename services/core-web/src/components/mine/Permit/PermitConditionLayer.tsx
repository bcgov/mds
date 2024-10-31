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
import { AddReportToPermitConditionForm } from "../../Forms/reports/AddReporttoPermitConditionForm";
import { createMineReport } from "@mds/common/redux/actionCreators/reportActionCreator";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";

interface PermitConditionLayerProps {
  condition: IPermitCondition;
  level?: number;
  isExpanded?: boolean;
  setParentExpand?: () => void;
}

const PermitConditionLayer: FC<PermitConditionLayerProps> = ({
  condition,
  isExpanded,
  level = 0,
  setParentExpand = () => {},
}) => {
  const dispatch = useDispatch();
  const { id: mineGuid, permitGuid } = useParams<{ id: string; permitGuid: string }>();

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [expandClass, setExpandClass] = useState(
    isExpanded ? "condition-expanded" : "condition-collapsed"
  );
  const className = `condition-layer condition-layer--${level} condition-${condition.condition_type_code} fade-in`;

  const handleSetParentExpand = () => {
    if ((level = 0)) {
      return;
    } else {
      setExpandClass("condition-expanded");
      setParentExpand();
    }
  };

  useEffect(() => {
    setExpandClass(isExpanded || isEditMode ? "condition-expanded" : "condition-collapsed");
  }, [isExpanded]);

  const handleSectionClick = (event) => {
    event.stopPropagation();
    setParentExpand();
    setIsEditMode(true);
  };

  const closeEdit = (event) => {
    event.stopPropagation();
    setIsEditMode(false);
  };

  const addNewReport = async (values) => {
    await dispatch(createMineReport(mineGuid, values));
    dispatch(fetchPermits(mineGuid));
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
        content: AddReportToPermitConditionForm,
      })
    );
  };

  const sectionEdit = isEditMode || false;

  return (
    <div
      className={`${className} ${isEditMode ? "condition-layer--editing" : ""}`}
      onClick={handleSectionClick}
      onKeyPress={handleSectionClick}
    >
      <div className={expandClass}>
        <p>
          {condition.step} {condition.condition}
        </p>
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
                  handleOpenAddReportModal(event, condition);
                }}
                icon={<FontAwesomeIcon icon={faClipboard} className="margin-medium--right" />}
                type="default"
                disabled={!!condition.report}
              >
                Add Report
              </Button>
              <Button
                onClick={closeEdit}
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
        {condition?.sub_conditions?.map((subCondition) => {
          return (
            <div key={subCondition.permit_condition_id}>
              <PermitConditionLayer
                condition={subCondition}
                level={level + 1}
                setParentExpand={handleSetParentExpand}
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
