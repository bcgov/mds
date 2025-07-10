import React, { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { change, Field, isDirty, reset } from "@mds/common/components/forms/form";
import { Row, Col, Button, Typography, Modal, Select } from "antd";
import {
    faArrowDown,
    faArrowUp,
    faCheck,
    faClipboard,
    faPlus,
    faTrashCan,
    faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import { IPermitCondition, IGroupedDropdownList, IPermitConditionTag } from "@mds/common/interfaces";
import { ERROR } from "@mds/common/constants/actionTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { openModal } from "@mds/common/redux/actions/modalActions";
import { ReportPermitRequirementForm } from "@mds/common/components/permits/ReportPermitRequirementForm";
import {
    deletePermitCondition,
    fetchPermitConditionTags,
    updatePermitCondition,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import RenderField from "@mds/common/components/forms/RenderField";
import { deleteConfirmWrapper } from "@mds/common/components/common/ActionMenu";
import { formatPermitConditionStep, parsePermitConditionStep } from "@mds/common/utils/helpers";
import { FORM } from "@mds/common/constants/forms";
import RenderGroupedSelect from "@mds/common/components/forms/RenderGroupedSelect";
import { PermitConditionsProvider, usePermitConditions } from "@mds/common/components/permits/PermitConditionsContext";
import { DeleteConditionModal } from "./DeleteConditionModal";
import { getPermitConditionTags } from "@mds/common/redux/reducers/permitReducer";
import RenderMultiSelect from "../forms/RenderMultiSelect";

interface PermitConditionFormProps {
    isExtracted: boolean;
    permitAmendmentGuid: string;
    condition: IPermitCondition;
    canEditPermitConditions: boolean;
    onEdit: () => void;
    setEditingFormName: (formName: string) => void;
    editingFormName: string;
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
    setEditingFormName,
    editingFormName,
    moveUp,
    moveDown,
    refreshData,
    setIsAddingListItem,
    isAddingListItem,
    categoryOptions,
}) => {
    const dispatch = useAppDispatch();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const permitConditionsValue = usePermitConditions();
    const { loading, setLoading } = permitConditionsValue;
    // the form fails to re-initialize when the category is changed, so concatenating it forces it to make a new one
    const formName = `${FORM.EDIT_PERMIT_CONDITION}_${condition.permit_condition_id}_${condition.condition_category_code}`;
    const editingFormDirty = useAppSelector(isDirty(editingFormName));
    const listItemFormDirty = useAppSelector(isDirty(FORM.EDIT_PERMIT_CONDITION));
    const conditionTags: IPermitConditionTag[] = useAppSelector(getPermitConditionTags);

    const startEdit = () => {
        const handleEdit = () => {
            onEdit();
            setEditingFormName(formName);
            setIsEditMode(true);
        }
        if (editingFormName && (editingFormDirty || listItemFormDirty)) {
            Modal.confirm({
                title: "Discard changes?",
                content: "Another condition is currently being edited. Do you want to continue editing or discard the changes?",
                onOk: () => {
                    dispatch(reset(editingFormName));
                    handleEdit()
                },
                cancelText: "Continue editing",
                okText: "Discard"
            })
        } else {
            handleEdit();
        }
    };

    const cancelEdit = () => {
        setIsEditMode(false);
        setEditingFormName(null);
        setIsAddingListItem(false);
    };

    // If the assigned user is changed while isEditMode
    // is true, set it to false
    useEffect(() => {
        if (!canEditPermitConditions) {
            setIsEditMode(false);
        }
    }, [canEditPermitConditions]);

    useEffect(() => {
        if (conditionTags?.length === 0) {
          dispatch(fetchPermitConditionTags());
        }
      }, [conditionTags]);

    // if edit is cancelled from another form
    useEffect(() => {
        if (editingFormName !== formName && isEditMode) {
            setIsEditMode(false);
            setIsAddingListItem(false);
        }
    }, [editingFormName]);

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
        const title = "Delete Condition";

        const onSubmit = async () => {
            const resp = await dispatch(
                deletePermitCondition(permitAmendmentGuid, condition.permit_condition_guid)
            );
            // @ts-ignore
            if (resp?.type !== ERROR) {
                refreshData();
                cancelEdit();
            }
        }

        dispatch(openModal({
            props: {
                title,
                condition,
                onSubmit
            },
            content: DeleteConditionModal
        }))
    };

    const handleOpenAddReportModal = (event, reportCondition: IPermitCondition) => {
        event.stopPropagation();
        dispatch(
            openModal({
                props: {
                    title: `Add Permit Required Report to Condition "${condition.stepPath}"`,
                    condition: reportCondition,
                    canEditPermitConditions: canEditPermitConditions,
                    refreshData: refreshData
                },
                content: (props) => <PermitConditionsProvider value={permitConditionsValue}> <ReportPermitRequirementForm {...props} /> </PermitConditionsProvider>,
            })
        );
    };

    const editingEnabled = editingFormName !== formName && canEditPermitConditions && !loading;

    const editableProps = editingEnabled
        ? {
            onClick: startEdit,
            title: `Edit Condition ${condition.stepPath}`,
            "aria-label": `Edit Condition ${condition.stepPath}`,
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

    const childTypeMap = {
        "SEC": "Condition",
        "CON": "List Item",
        "LIS": "List Item"
    };
    const childConditionType = childTypeMap[condition.condition_type_code];

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
            isModal={true}
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
                className={`condition-content ${!editingFormName ? "editable" : ""}${!condition.parent_permit_condition_id ? " top-level-condition" : ""}`}
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
                                                {childConditionType}
                                            </Button>
                                        </Col>
                                    )}
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
                                        <div className="condition-tag-select">
                                        <Field
                                            name="condition_tags"
                                            component={RenderMultiSelect}
                                            placeholder="Select tags"
                                            data={conditionTags.map((tag) => ({
                                                label: tag.description,
                                                value: tag.permit_condition_tag_guid}))}
                                        />
                                        </div>

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
                </Col>
            </Row>
        </FormWrapper>
    );
};

export default PermitConditionForm;
