import React, { FC, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { change, Field, isDirty, reset } from "@mds/common/components/forms/form";
import { Row, Col, Button, Typography, Modal, Tag } from "antd";
import {
    faArrowDown,
    faArrowUp,
    faCheck,
    faClipboard,
    faPlus,
    faTrashCan,
    faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import { IPermitCondition, IGroupedDropdownList, IPermitConditionTag, IStandardPermitCondition } from "@mds/common/interfaces";
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
    deleteStandardPermitCondition,
    updatePermitCondition,
    updateStandardPermitCondition,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import RenderField from "@mds/common/components/forms/RenderField";
import { formatPermitConditionStep, parsePermitConditionStep } from "@mds/common/utils/helpers";
import { FORM } from "@mds/common/constants/forms";
import RenderGroupedSelect from "@mds/common/components/forms/RenderGroupedSelect";
import { PermitConditionsProvider, usePermitConditions } from "@mds/common/components/permits/PermitConditionsContext";
import { getMineReportPermitRequirementsByAmendment } from "@mds/common/redux/selectors/permitSelectors";
import { getStandardReportRequirements } from "@mds/common/redux/slices/mineReportPermitRequirementSlice";
import { DeleteConditionModal } from "./DeleteConditionModal";
import RenderMultiSelect from "../forms/RenderMultiSelect";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import { getPermitConditionTags } from "@mds/common/redux/slices/permitConditionTagSlice";
import VariableConditionMenu from "./VariableConditionMenu";
import Highlight from "react-highlighter";
import { highlightPermitConditionVariables } from "@mds/common/redux/utils/helpers";
import { TextAreaRef } from "antd/lib/input/TextArea";

interface PermitConditionFormProps {
    isExtracted: boolean;
    permitAmendmentGuid: string;
    condition: IPermitCondition | IStandardPermitCondition;
    canEditPermitConditions: boolean;
    onEdit: () => void;
    setEditingFormName: (formName: string | null) => void;
    editingFormName: string | null;
    moveUp?: (condition: IPermitCondition | IStandardPermitCondition) => Promise<void>;
    moveDown?: (condition: IPermitCondition | IStandardPermitCondition) => Promise<void>;
    refreshData: (closeForm?: boolean) => Promise<void>;
    setIsAddingListItem: (isAdding: boolean) => void;
    isAddingListItem: boolean;
    categoryOptions?: IGroupedDropdownList[];
    isSubmittingConditionFamily?: boolean;
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
    isSubmittingConditionFamily = false,
}) => {
    const dispatch = useAppDispatch();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { isFeatureEnabled } = useFeatureFlag();
    const permitConditionsValue = usePermitConditions();
    const {
        loading,
        setLoading,
        isNowEditor,
        isStandardConditionEditor,
        permitGuid,
        setActiveConditionId,
        clearActiveConditionId,
        addSubmittingCondition,
        removeSubmittingCondition,
        submittingConditionIds
    } = permitConditionsValue;

    const allPermitReqs = useAppSelector(getMineReportPermitRequirementsByAmendment(permitGuid, permitAmendmentGuid, isNowEditor));
    const standardReqs = useAppSelector(getStandardReportRequirements);
    const relevantReqs = isStandardConditionEditor ? standardReqs : allPermitReqs;
    const existingRequirement = relevantReqs?.find(
        (r) => r.permit_condition_ids?.includes(condition.permit_condition_id)
    );
    const hasReportRequirement = !!existingRequirement;
    const editingAllowed = isStandardConditionEditor || isExtracted || isNowEditor;
    // the form fails to re-initialize when the category is changed, so concatenating it forces it to make a new one
    const formName = `${FORM.EDIT_PERMIT_CONDITION}_${condition.permit_condition_id}_${condition.condition_category_code}`;
    const editingFormDirty = useAppSelector(isDirty(editingFormName ?? ''));
    const listItemFormDirty = useAppSelector(isDirty(FORM.EDIT_PERMIT_CONDITION));
    const conditionTags: IPermitConditionTag[] = useAppSelector(getPermitConditionTags);
    const stepEditDisabled = isStandardConditionEditor || isNowEditor;
    const showVariableConditionMenu = stepEditDisabled;
    const enablePermitConditionTags = isFeatureEnabled(Feature.PERMIT_CONDITION_TAGS);
    const conditionInputRef = useRef<TextAreaRef | null>(null);

    const editingFormNameRef = useRef(editingFormName);
    useEffect(() => {
        editingFormNameRef.current = editingFormName;
    }, [editingFormName]);
    const startEdit = () => {
        const handleEdit = () => {
            onEdit();
            setEditingFormName(formName);
            setIsEditMode(true);
            setActiveConditionId(condition.permit_condition_id);
        };

        const editingFormSubmitting = editingFormName != null &&
            Object.keys(submittingConditionIds).some(id => editingFormName.includes(`_${id}_`));

        if (editingFormName && !editingFormSubmitting && (editingFormDirty || listItemFormDirty)) {
            Modal.confirm({
                title: "Discard changes?",
                content: "Another condition is currently being edited. Do you want to continue editing or discard the changes?",
                onOk: () => {
                    dispatch(reset(editingFormName));
                    handleEdit();
                },
                cancelText: "Continue editing",
                okText: "Discard",
            });
        } else {
            if (editingFormName) {
                dispatch(reset(editingFormName));
            }
            handleEdit();
        }
    };

    const cancelEdit = () => {
        setIsEditMode(false);
        setEditingFormName(null);
        setIsAddingListItem(false);
        setActiveConditionId(null);
    };

    // If the assigned user is changed while isEditMode
    // is true, set it to false
    useEffect(() => {
        if (!canEditPermitConditions) {
            setIsEditMode(false);
            setActiveConditionId(null);
        }
    }, [canEditPermitConditions]);

    // if edit is cancelled from another form
    useEffect(() => {
        if (editingFormName !== formName && isEditMode) {
            setIsEditMode(false);
            setIsAddingListItem(false);
        }
    }, [editingFormName]);

    const handleSubmit = async (values) => {
        setLoading(true);
        setIsSubmitting(true);
        addSubmittingCondition(condition.permit_condition_id);
        try {
            const payload = values.step && !stepEditDisabled
                ? {
                    ...values,
                    // Backend has the property named as _step to update in the db
                    _step: values.step,
                }
                : values;
            let resp;
            if (isStandardConditionEditor) {
                resp = await dispatch(updateStandardPermitCondition(values.standard_permit_condition_guid, values))
            } else {
                resp = await dispatch(
                    updatePermitCondition(values.permit_condition_guid, permitAmendmentGuid, payload)
                );
            }
            // @ts-ignore
            if (resp?.type !== ERROR) {
                const submittedId = condition.permit_condition_id;
                await refreshData(false);
                dispatch(reset(formName));
                removeSubmittingCondition(submittedId);
                clearActiveConditionId(submittedId);
                setIsEditMode(false);
                setIsAddingListItem(false);
                if (editingFormNameRef.current === formName) {
                    setEditingFormName(null);
                }
            } else {
                removeSubmittingCondition(condition.permit_condition_id);
            }
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };
    const handleCancel = () => {
        cancelEdit();
        dispatch(reset(formName));
    };
    const handleAddListItem = () => {
        setIsAddingListItem(true);
        setActiveConditionId(condition.permit_condition_id);
    };

    const handleDelete = async () => {
        const title = "Delete Condition";

        const onSubmit = async () => {
            const deletedId = condition.permit_condition_id;
            setLoading(true);
            addSubmittingCondition(deletedId);
            try {
                let resp;
                if ('standard_permit_condition_guid' in condition) {
                    resp = await dispatch(deleteStandardPermitCondition(condition.standard_permit_condition_guid));
                } else {
                    resp = await dispatch(
                        deletePermitCondition(permitAmendmentGuid, condition.permit_condition_guid)
                    );
                }
                // @ts-ignore
                if (resp?.type !== ERROR) {
                    cancelEdit();
                    await refreshData(false);
                }
            } finally {
                removeSubmittingCondition(deletedId);
                setLoading(false);
            }
        }

        dispatch(openModal({
            props: {
                title,
                condition,
                onSubmit,
                onCancel: cancelEdit,
            },
            content: DeleteConditionModal
        }))
    };

    const handleOpenAddReportModal = (event, reportCondition: IPermitCondition | IStandardPermitCondition) => {
        event.stopPropagation();
        setActiveConditionId(condition.permit_condition_id);
        const openReportModal = async () => await dispatch(
            openModal({
                props: {
                    title: `Add Permit Required Report to Condition "${condition.stepPath}"`,
                    condition: reportCondition,
                    mineReportPermitRequirement: existingRequirement,
                    canEditPermitConditions: canEditPermitConditions,
                    refreshData: refreshData
                },
                content: (props) => <PermitConditionsProvider value={permitConditionsValue}> <ReportPermitRequirementForm {...props} /> </PermitConditionsProvider>,
            })
        );
        const formDirty = editingFormDirty || listItemFormDirty;

        return formDirty ? Modal.confirm({
            title: "Cancel editing condition?",
            content: "Adding a report will cancel changes made to the condition",
            onOk: openReportModal,
            cancelText: "Edit Condition",
            okText: "Add Report"
        }) : openReportModal();
    };

    const editingEnabled = editingFormName !== formName && canEditPermitConditions && !isSubmittingConditionFamily;

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
        <Col>
            <Row
                wrap={false}
                align="top"
                className={`condition-content ${editingEnabled ? "editable" : ""}`}
            >
                <Col className="step-column" >
                    <Typography.Paragraph className="view-item-value">
                        {formatPermitConditionStep(condition.step)}
                    </Typography.Paragraph>
                </Col>
                <Col className="condition-column" {...editableProps}>
                    <Typography.Paragraph className="view-item-value">
                        <Highlight className="injectable-string" search={highlightPermitConditionVariables()}>
                            {condition.condition}
                        </Highlight>
                    </Typography.Paragraph>
                </Col>
            </Row>
            {enablePermitConditionTags && conditionTags &&
                <Row>
                    {condition?.condition_tags.map((tagGuid) => {
                        const tag = conditionTags.find((t) => t.permit_condition_tag_guid === tagGuid);
                        if (!tag) return null;
                        return (
                            <Tag color="green" key={tag.permit_condition_tag_guid}>
                                {tag.description}
                            </Tag>
                        );
                    })}
                </Row>
            }
        </Col>
    ) : (
        <FormWrapper
            isEditMode={isEditMode && editingAllowed}
            onSubmit={handleSubmit}
            name={formName}
            initialValues={condition}
            scrollOnToggleEdit={false}
            reduxFormConfig={{
                enableReinitialize: true,
                keepDirtyOnReinitialize: true,
                touchOnChange: false,
                touchOnBlur: true,
            }}
        >
            {isEditMode && editingAllowed && categoryOptions && (
                <Row>
                    <Col span={24}>
                        <Field
                            showOptional={false}
                            label="Condition Category:"
                            component={RenderGroupedSelect}
                            name="condition_category_code"
                            data={categoryOptions}
                            allowClear={false}
                            className="horizontal-form-item"
                            disabled={isSubmitting || isSubmittingConditionFamily}
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
                        disabled={isAddingListItem || stepEditDisabled || isSubmitting || isSubmittingConditionFamily}
                        onChange={handleBackSpace}
                    />
                </Col>
                <Col className="condition-column" {...editableProps}>
                    <Col className="condition-editor">
                        {showVariableConditionMenu && <VariableConditionMenu inputRef={conditionInputRef} isManagementView={isStandardConditionEditor} conditionForm={editingFormName} />}
                        <Field
                            name="condition"
                            component={RenderAutoSizeField}
                            disabled={isAddingListItem || isSubmitting || isSubmittingConditionFamily}
                            inputRef={conditionInputRef}
                        />
                    </Col>
                    {isEditMode && !isAddingListItem && (
                        <Row justify="space-between" align="top" wrap={false}>
                            <Col>
                                <Row gutter={8} className="condition-edit-buttons">
                                    {editingAllowed && (
                                        <Col>
                                            <Button
                                                loading={isSubmitting || isSubmittingConditionFamily || (loading && isAddingListItem)}
                                                disabled={isSubmitting || isSubmittingConditionFamily}
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
                                            loading={isSubmitting || isSubmittingConditionFamily}
                                            className="fa-icon-container btn-sm-padding"
                                            type="default"
                                            icon={<FontAwesomeIcon icon={faClipboard} />}
                                            onClick={(e) => handleOpenAddReportModal(e, condition)}
                                            disabled={isSubmitting || isSubmittingConditionFamily || hasReportRequirement}
                                        >
                                            {hasReportRequirement
                                                ? "Report Added"
                                                : "Add Report Requirement"}
                                        </Button>
                                    </Col>
                                    {enablePermitConditionTags && conditionTags &&
                                        (<Col className="condition-tag-select">
                                            <Field
                                                name="condition_tags"
                                                component={RenderMultiSelect}
                                                placeholder="Select tags"
                                                enableGetPopupContainer={true}
                                                disabled={isSubmitting || isSubmittingConditionFamily}
                                                data={conditionTags.map((tag) => ({
                                                    label: tag.description,
                                                    value: tag.permit_condition_tag_guid
                                                }))}
                                            />
                                        </Col>)
                                    }
                                    <Col>
                                        <Row gutter={8}>
                                            <Col>
                                                <RenderCancelButton
                                                    disabled={isSubmitting || isSubmittingConditionFamily}
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
                                                    disabled={isSubmitting || isSubmittingConditionFamily}
                                                    buttonProps={{
                                                        icon: <FontAwesomeIcon icon={faCheck} />,
                                                    }}
                                                    iconButton
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                            {editingAllowed && (
                                <Col style={{ flexShrink: 0 }}>
                                    <Row gutter={8} align="middle" className="condition-edit-buttons">
                                        <Col>
                                            <Button
                                                disabled={isSubmitting || isSubmittingConditionFamily}
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
                                                disabled={!moveUp || isSubmitting || isSubmittingConditionFamily}
                                                icon={<FontAwesomeIcon icon={faArrowUp} />}
                                                onClick={() => moveUp(condition)}
                                            />
                                        </Col>
                                        <Col>
                                            <Button
                                                className="fa-icon-container"
                                                aria-label="Move Condition Down"
                                                type="default"
                                                disabled={!moveDown || isSubmitting || isSubmittingConditionFamily}
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
