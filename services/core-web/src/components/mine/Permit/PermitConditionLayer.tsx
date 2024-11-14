import React, { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { IPermitCondition } from "@mds/common/interfaces/permits/permitCondition.interface";
import { Button, Col, Row } from "antd";
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
import { ReportPermitRequirementForm } from "../../Forms/reports/ReportPermitRequirementForm";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { createMineReportPermitRequirement } from "@mds/common/redux/slices/mineReportPermitRequirementSlice";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common";

interface PermitConditionLayerProps {
  condition: IPermitCondition;
  level?: number;
  isExpanded?: boolean;
  setParentExpand?: () => void;
  userCanEdit?: boolean;
}

const PermitConditionLayer: FC<PermitConditionLayerProps> = ({
  condition,
  isExpanded,
  level = 0,
  setParentExpand = () => {},
  userCanEdit = false,
}) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const canEditPermitConditions = isFeatureEnabled(Feature.MODIFY_PERMIT_CONDITIONS) && userCanEdit;
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
    if (canEditPermitConditions) {
      event.stopPropagation();
      setParentExpand();
      setIsEditMode(true);
    }
  };

  const closeEdit = (event) => {
    event.stopPropagation();
    setIsEditMode(false);
  };

  const addNewReport = async (values) => {
    await dispatch(createMineReportPermitRequirement({ mineGuid, values }));
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
        content: ReportPermitRequirementForm,
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
        {sectionEdit && canEditPermitConditions && (
          <Row justify="space-between" align="middle">
            <Col>
              <Row gutter={8} className="condition-edit-buttons" align="middle">
                <Col>
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
                </Col>
                <Col>
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
                </Col>
                <Col>
                  <Button
                    onClick={(event) => {
                      handleOpenAddReportModal(event, condition);
                    }}
                    icon={<FontAwesomeIcon icon={faClipboard} className="margin-medium--right" />}
                    type="default"
                    disabled={!!condition.mineReportPermitRequirement}
                  >
                    Add Report Requirement
                  </Button>
                </Col>
                <Col className="margin-medium--left">
                  <Button
                    className="icon-button-container"
                    onClick={closeEdit}
                    type="primary"
                    icon={<FontAwesomeIcon icon={faXmark} />}
                  />
                </Col>
                <Col className="icon-button-container">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      console.log("Not yet implemented");
                    }}
                    type="primary"
                    icon={<FontAwesomeIcon icon={faCheck} />}
                  />
                </Col>
              </Row>
            </Col>
            <Col>
              <Row gutter={8} align="middle" className="condition-edit-buttons">
                <Col className="icon-button-container">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    type="default"
                    icon={<FontAwesomeIcon icon={faTrashCan} />}
                  />
                </Col>
                <Col className="icon-button-container">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    type="default"
                    icon={<FontAwesomeIcon icon={faArrowUp} />}
                  />
                </Col>
                <Col className="icon-button-container">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      console.log("Not yet implemented");
                    }}
                    type="default"
                    icon={<FontAwesomeIcon icon={faArrowDown} />}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        )}
        {condition?.sub_conditions?.map((subCondition) => {
          return (
            <div key={subCondition.permit_condition_id}>
              <PermitConditionLayer
                condition={subCondition}
                level={level + 1}
                setParentExpand={handleSetParentExpand}
                userCanEdit={userCanEdit}
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
