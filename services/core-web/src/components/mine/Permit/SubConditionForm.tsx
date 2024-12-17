import React, { FC } from "react";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import {
    faCheck,
    faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import { FORM, IPermitCondition, IPermitConditionCategory } from "@mds/common";
import { ERROR } from "@mds/common/constants/actionTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch } from "react-redux";
import { createPermitCondition } from "@mds/common/redux/actionCreators/permitActionCreator";

interface SubConditionFormProps {
    level?: number;
    conditionCategory?: IPermitConditionCategory;
    parentCondition?: IPermitCondition;
    handleCancel: () => void;
    onSubmit: () => Promise<void>;
    permitAmendmentGuid: string;
};

const SubConditionForm: FC<SubConditionFormProps> = ({ level = 1, parentCondition, conditionCategory, permitAmendmentGuid, handleCancel, onSubmit }) => {
    const dispatch = useDispatch();

    const handleSubmit = async (values) => {
        const resp = await dispatch(createPermitCondition(
            permitAmendmentGuid,
            values
        ));
        // @ts-ignore
        if (resp?.type !== ERROR) {
            onSubmit();
        }
    }

    const getConditionTypeCode = () => {
        if (!parentCondition) {
            return "SEC"
        };
        if (parentCondition.condition_type_code === "SEC") {
            return "CON";
        }
        return "LIS";
    };
    const getPlaceHolderText = (conditionTypeCode: string = "SEC") => {
        return {
            SEC: "Enter Sub-Section title",
            CON: "Enter a condition",
            LIS: "Enter a list item"
        }[conditionTypeCode]
    }

    const emptyCondition = parentCondition ? {
        condition_category_code: parentCondition.condition_category_code,
        condition_type_code: getConditionTypeCode(),
        display_order: parentCondition.sub_conditions.length + 1,
        parent_permit_condition_id: parentCondition.permit_condition_id,
    } : {
        condition_category_code: conditionCategory.condition_category_code,
        condition_type_code: getConditionTypeCode(),
        display_order: conditionCategory.conditions.length + 1,
    }
    return (
        <FormWrapper
            name={FORM.EDIT_PERMIT_CONDITION}
            isEditMode={true}
            onSubmit={handleSubmit}
            initialValues={emptyCondition}
            scrollOnToggleEdit={false}
        >
            <div className={`condition-layer condition-layer--${level} condition-${emptyCondition.condition_type_code} fade-in`}>
                <Row wrap={false} >
                    <Col span={24}>
                        <Field
                            placeholder={getPlaceHolderText(emptyCondition.condition_type_code)}
                            name="condition"
                            component={RenderAutoSizeField}
                            autoFocus
                        />
                    </Col>
                </Row>
                <Row gutter={8}
                    className="condition-edit-buttons"
                >
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
            </div>
        </FormWrapper>
    );
};

export default SubConditionForm;