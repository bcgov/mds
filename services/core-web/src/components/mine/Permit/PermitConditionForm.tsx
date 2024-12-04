import React, { FC, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Field, reset } from "redux-form";
import { Row, Col, Button } from "antd";
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
import { FORM, IPermitCondition } from "@mds/common";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { ReportPermitRequirementForm } from "../../Forms/reports/ReportPermitRequirementForm";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { createMineReportPermitRequirement } from "@mds/common/redux/slices/mineReportPermitRequirementSlice";
import RenderField from "@mds/common/components/forms/RenderField";


interface PermitConditionFormProps {
    condition: IPermitCondition;
    canEditPermitConditions: boolean;
    onEdit: () => void;
    setEditingConditionGuid: (condition_guid: string) => void;
    editingConditionGuid: string;
}
const PermitConditionForm: FC<PermitConditionFormProps> = ({
    canEditPermitConditions,
    condition,
    onEdit,
    setEditingConditionGuid,
    editingConditionGuid
}) => {
    const dispatch = useDispatch();
    const { id: mineGuid, permitGuid } = useParams<{ id: string; permitGuid: string }>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const formName = `${FORM.EDIT_PERMIT_CONDITION}_${condition.permit_condition_id}`;

    const startEdit = () => {
        onEdit();
        setEditingConditionGuid(condition.permit_condition_guid)
        setIsEditMode(true);
    };

    const handleSubmit = (values) => {

    };
    const handleCancel = () => {
        setEditingConditionGuid(null);
        setIsEditMode(false);
        dispatch(reset(formName));
    };
    const handleAddListItem = () => {

    };

    const handleLinkDocument = () => {

    };

    const handleDelete = () => {

    };
    const handleMoveUp = () => {

    };
    const handleMoveDown = () => {

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

    if (isEditMode) {
        console.log('condition', condition)
    }

    return (
        <FormWrapper
            isEditMode={isEditMode}
            onSubmit={handleSubmit}
            name={formName}
            initialValues={condition}
            scrollOnToggleEdit={false}
        >
            <Row wrap={false} className={`condition-content ${!editingConditionGuid ? "editable" : ""}`}>
                <Col className="step-column">
                    <Field
                        name="step"
                        component={RenderField}
                        showNA={false}
                    />
                </Col>
                <Col className="condition-column"
                    onClick={!editingConditionGuid && canEditPermitConditions && startEdit}
                >
                    <Field
                        name="condition"
                        component={RenderAutoSizeField}
                    />
                </Col>
            </Row>
            {isEditMode && (
                <Row justify="space-between" align="middle">
                    <Col>
                        <Row gutter={8}
                            className="condition-edit-buttons"
                        >
                            <Col>
                                <Button
                                    className="fa-icon-container btn-sm-padding"
                                    type="default"
                                    icon={<FontAwesomeIcon icon={faPlus} />}
                                    onClick={handleAddListItem}
                                >List Item</Button>
                            </Col>
                            <Col>
                                <Button
                                    className="fa-icon-container btn-sm-padding"
                                    type="default"
                                    icon={<FontAwesomeIcon icon={faLink} />}
                                    onClick={handleLinkDocument}
                                >
                                    Link Document
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    className="fa-icon-container btn-sm-padding"
                                    type="default"
                                    icon={<FontAwesomeIcon icon={faClipboard} />}
                                    onClick={(e) => handleOpenAddReportModal(e, condition)}
                                >
                                    Add Report Requirement
                                </Button>
                            </Col>
                            <Col>
                                <RenderCancelButton
                                    cancelFunction={handleCancel}
                                    buttonProps={{
                                        type: "primary",
                                        icon: <FontAwesomeIcon icon={faXmark} />
                                    }}
                                    iconButton
                                />
                            </Col>
                            <Col>
                                <RenderSubmitButton
                                    buttonProps={{
                                        icon: <FontAwesomeIcon icon={faCheck} />
                                    }}
                                    iconButton
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Row gutter={8} align="middle">
                            <Col>
                                <Button
                                    className="fa-icon-container"
                                    type="default"
                                    icon={<FontAwesomeIcon icon={faTrashCan} />}
                                    onClick={handleDelete}
                                />
                            </Col>
                            <Col>
                                <Button
                                    className="fa-icon-container"
                                    type="default"
                                    icon={<FontAwesomeIcon icon={faArrowUp} />}
                                    onClick={handleMoveUp}
                                />
                            </Col>
                            <Col>
                                <Button
                                    className="fa-icon-container"
                                    type="default"
                                    icon={<FontAwesomeIcon icon={faArrowDown} />}
                                    onClick={handleMoveDown}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            )}
        </FormWrapper>
    );
};

export default PermitConditionForm;