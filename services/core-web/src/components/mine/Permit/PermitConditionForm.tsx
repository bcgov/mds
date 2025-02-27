import React, { FC, useEffect, useState } from "react";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { useParams } from "react-router-dom";
import { change, Field, reset } from "@mds/common/components/forms/form";
import { Row, Col, Button, Typography } from "antd";
import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faClipboard,
  faPlus,
  faTrashCan,
  faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import { IPermitCondition, IGroupedDropdownList } from "@mds/common/interfaces";
import { ERROR } from "@mds/common/constants/actionTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { ReportPermitRequirementForm } from "../../Forms/reports/ReportPermitRequirementForm";
import {
  deletePermitCondition,
  updatePermitCondition,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { createMineReportPermitRequirement } from "@mds/common/redux/slices/mineReportPermitRequirementSlice";
import RenderField from "@mds/common/components/forms/RenderField";
import { deleteConfirmWrapper } from "@mds/common/components/common/ActionMenu";
import { formatPermitConditionStep, parsePermitConditionStep } from "@mds/common/utils/helpers";
import { FORM } from "@mds/common/constants/forms";
import RenderGroupedSelect from "@mds/common/components/forms/RenderGroupedSelect";
import { usePermitConditions } from "./PermitConditionsContext";

interface PermitConditionFormProps {
  isExtracted: boolean;
  permitAmendmentGuid: string;
  condition: IPermitCondition;
  canEditPermitConditions: boolean;
  onEdit: () => void;
  setEditingConditionGuid: (condition_guid: string) => void;
  editingConditionGuid: string;
  moveUp?: (condition: IPermitCondition) => Promise<void>;
  moveDown?: (condition: IPermitCondition) => Promise<void>;
  refreshData: () => Promise<void>;
  setIsAddingListItem: (isAdding: boolean) => void;
  isAddingListItem: boolean;
  categoryOptions?: IGroupedDropdownList[];
}
const PermitConditionForm: FC<PermitConditionFormProps> = ({
  isExtracted,
  permitAmendmentGuid,
  canEditPermitConditions,
  condition,
  onEdit,
  setEditingConditionGuid,
  editingConditionGuid,
  moveUp,
  moveDown,
  refreshData,
  setIsAddingListItem,
  isAddingListItem,
  categoryOptions,
}) => {
  const dispatch = useAppDispatch();
  const { id: mineGuid, permitGuid } = useParams<{ id: string; permitGuid: string }>();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { currentAmendment, loading, setLoading } = usePermitConditions();
  // the form fails to re-initialize when the category is changed, so concatenating it forces it to make a new one
  const formName = `${FORM.EDIT_PERMIT_CONDITION}_${condition.permit_condition_id}_${condition.condition_category_code}`;

  const startEdit = () => {
    onEdit();
    setEditingConditionGuid(condition.permit_condition_guid);
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingConditionGuid(null);
    setIsAddingListItem(false);
  };

  // If the assigned user is changed while isEditMode
  // is true, set it to false
  useEffect(() => {
    if (!canEditPermitConditions) {
      setIsEditMode(false);
    }
  }, [canEditPermitConditions]);

  const handleSubmit = async (values) => {
    setLoading(true);
    const payload = values.step
      ? {
          ...values,
          // Backend has the property named as _step to update in the db
          _step: values.step,
        }
      : values;
    const resp = await dispatch(
      updatePermitCondition(values.permit_condition_guid, permitAmendmentGuid, payload)
    );
    // @ts-ignore
    if (resp?.type !== ERROR) {
      cancelEdit();
      refreshData();
    }
    setLoading(false);
  };
  const handleCancel = () => {
    cancelEdit();
    dispatch(reset(formName));
  };
  const handleAddListItem = () => {
    setIsAddingListItem(true);
  };

  const handleDelete = async () => {
    deleteConfirmWrapper("Permit Condition", async () => {
      const resp = await dispatch(
        deletePermitCondition(permitAmendmentGuid, condition.permit_condition_guid)
      );
      // @ts-ignore
      if (resp?.type !== ERROR) {
        refreshData();
        cancelEdit();
      }
    });
  };

  const addNewReport = async (values) => {
    await dispatch(createMineReportPermitRequirement({ mineGuid, values }));
    refreshData();
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
          canEditPermitConditions: canEditPermitConditions,
          permitGuid,
          mineGuid,
          currentAmendment,
        },
        content: ReportPermitRequirementForm,
      })
    );
  };

  const editingEnabled = !editingConditionGuid && canEditPermitConditions && !loading;

  const editableProps = editingEnabled
    ? {
        onClick: startEdit,
        title: "Edit Condition",
        "aria-label": "Edit Condition",
      }
    : {};

  // deals with how the formatting prevents backspace
  const handleBackSpace = (event, value: string, prev: string, name: string) => {
    const { nativeEvent } = event;
    if (nativeEvent?.inputType === "deleteContentBackward" && value === prev) {
      event.preventDefault();
      const newVal = value.substring(0, value.length - 1);
      dispatch(change(formName, name, newVal));
    }
  };

  return !isEditMode ? (
    <Row
      wrap={false}
      align="top"
      className={`condition-content ${editingEnabled ? "editable" : ""}`}
    >
      <Col className="step-column" style={{ flexShrink: 0 }}>
        <Typography.Paragraph className="view-item-value">
          {formatPermitConditionStep(condition.step)}
        </Typography.Paragraph>
      </Col>
      <Col className="condition-column" {...editableProps}>
        <Typography.Paragraph className="view-item-value">
          {condition.condition}
        </Typography.Paragraph>
      </Col>
    </Row>
  ) : (
    <FormWrapper
      isEditMode={isEditMode && isExtracted}
      onSubmit={handleSubmit}
      name={formName}
      initialValues={condition}
      scrollOnToggleEdit={false}
      reduxFormConfig={{
        enableReinitialize: true,
        touchOnChange: false,
        touchOnBlur: true,
      }}
    >
      {isEditMode && isExtracted && categoryOptions && (
        <Row>
          <Col span={24}>
            <Field
              disabled={loading}
              showOptional={false}
              label="Condition Category:"
              component={RenderGroupedSelect}
              name="condition_category_code"
              data={categoryOptions}
              allowClear={false}
              className="horizontal-form-item"
            />
          </Col>
        </Row>
      )}
      <Row
        wrap={false}
        align="top"
        className={`condition-content ${!editingConditionGuid ? "editable" : ""}${!condition.parent_permit_condition_id ? " top-level-condition" : ""}`}
      >
        <Col className="step-column" style={{ flexShrink: 0 }}>
          <Field
            format={(value: string) => formatPermitConditionStep(value)}
            parse={(value: string) => parsePermitConditionStep(value)}
            name="step"
            component={RenderField}
            showNA={false}
            disabled={isAddingListItem || loading}
            onChange={handleBackSpace}
          />
        </Col>
        <Col className="condition-column" {...editableProps}>
          <Field
            name="condition"
            component={RenderAutoSizeField}
            disabled={isAddingListItem || loading}
          />
        </Col>
      </Row>
      {isEditMode && !isAddingListItem && (
        <Row justify="space-between" align="middle">
          <Col>
            <Row gutter={8} className="condition-edit-buttons">
              {isExtracted && (
                <Col>
                  <Button
                    loading={loading}
                    className="fa-icon-container btn-sm-padding"
                    type="default"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={handleAddListItem}
                  >
                    List Item
                  </Button>
                </Col>
              )}
              {/* <Col>
                                    <Button
                                        className="fa-icon-container btn-sm-padding"
                                        type="default"
                                        icon={<FontAwesomeIcon icon={faLink} />}
                                        onClick={handleLinkDocument}
                                    >
                                        Link Document
                                    </Button>
                                </Col> */}
              <Col>
                <Button
                  loading={loading}
                  className="fa-icon-container btn-sm-padding"
                  type="default"
                  icon={<FontAwesomeIcon icon={faClipboard} />}
                  onClick={(e) => handleOpenAddReportModal(e, condition)}
                  disabled={condition?.mineReportPermitRequirement !== undefined}
                >
                  {condition?.mineReportPermitRequirement
                    ? "Report Added"
                    : "Add Report Requirement"}
                </Button>
              </Col>
              <Col>
                <RenderCancelButton
                  disabled={loading}
                  cancelFunction={handleCancel}
                  buttonProps={{
                    type: "primary",
                    icon: <FontAwesomeIcon icon={faXmark} />,
                  }}
                  iconButton
                />
              </Col>
              <Col>
                <RenderSubmitButton
                  disabled={loading}
                  buttonProps={{
                    icon: <FontAwesomeIcon icon={faCheck} />,
                  }}
                  iconButton
                />
              </Col>
            </Row>
          </Col>
          {isExtracted && (
            <Col>
              <Row gutter={8} align="middle" className="condition-edit-buttons">
                <Col>
                  <Button
                    disabled={loading}
                    className="fa-icon-container"
                    aria-label="Delete Condition"
                    type="default"
                    icon={<FontAwesomeIcon icon={faTrashCan} />}
                    onClick={handleDelete}
                  />
                </Col>
                <Col>
                  <Button
                    className="fa-icon-container"
                    aria-label="Move Condition Up"
                    type="default"
                    disabled={!moveUp || loading}
                    icon={<FontAwesomeIcon icon={faArrowUp} />}
                    onClick={() => moveUp(condition)}
                  />
                </Col>
                <Col>
                  <Button
                    className="fa-icon-container"
                    aria-label="Move Condition Down"
                    type="default"
                    disabled={!moveDown || loading}
                    icon={<FontAwesomeIcon icon={faArrowDown} />}
                    onClick={() => moveDown(condition)}
                  />
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      )}
    </FormWrapper>
  );
};

export default PermitConditionForm;
