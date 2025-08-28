import React, { FC, useEffect, useMemo } from "react";
import { Col, Collapse, Row, Spin, Typography } from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { IFormattedConditionCategory, IPermitCondition, IPermitConditionCategory, IPermitConditionTag, IStandardPermitCondition } from "@mds/common/interfaces";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import SubConditionForm from "./SubConditionForm";
import PermitConditionLayer from "./PermitConditionLayer";
import PermitConditionReviewAssignment from "./PermitConditionReviewAssignment";
import CoreButton from "../common/CoreButton";
import { EditPermitConditionCategoryInline } from "./PermitConditionCategory";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { deletePermitAmendmentConditionCategory, updatePermitAmendmentConditionCategory, updatePermitCondition, updateStandardPermitCondition } from "@mds/common/redux/actionCreators/permitActionCreator";
import { usePermitConditions } from "./PermitConditionsContext";
import { createDropDownList } from "@mds/common/redux/utils/helpers";
import { getPermitConditionCategoryOptions } from "@mds/common/redux/reducers/staticContentReducer";
import { FORM } from "@mds/common/constants/forms";
import { fetchPermitConditionTags, getPermitConditionTags } from "@mds/common/redux/slices/permitConditionTagSlice";
import VariableConditionMenu from "./VariableConditionMenu";

const { Title } = Typography;

interface PermitConditionViewEditProps {
    isExtracted?: boolean;
    userReviewCategoryCodes?: any[];
    userCanEdit: boolean;
    formattedCategories: IFormattedConditionCategory[];
    collapseCategories?: boolean;
    isExpanded?: boolean;
    setSelectedCondition?: (condition: IPermitCondition) => void;
    editingFormName: string;
    setEditingFormName: (formName: string) => void;
    addingToCategoryCode: string;
    setAddingToCategoryCode: (categoryCode: string) => void;
}

const PermitConditionViewEdit: FC<PermitConditionViewEditProps> = ({
    userCanEdit,
    formattedCategories,
    isExtracted = false,
    userReviewCategoryCodes = [],
    collapseCategories = false,
    isExpanded = true,
    setSelectedCondition,
    editingFormName,
    setEditingFormName,
    addingToCategoryCode,
    setAddingToCategoryCode
}) => {
    const {
        mineGuid,
        permitGuid,
        currentAmendment,
        loading,
        setLoading,
        standardConditionType,
        isNowEditor,
        refreshData,
    } = usePermitConditions();

    const { isFeatureEnabled } = useFeatureFlag();
    const dispatch = useAppDispatch();
    const defaultPermitConditionCategories = useAppSelector(getPermitConditionCategoryOptions);

    const conditionTags: IPermitConditionTag[] = useAppSelector(getPermitConditionTags);
    const isStandardConditions = Boolean(standardConditionType);
    const canAddConditions = isStandardConditions || isExtracted || isNowEditor;
    const areTagsEnabled = isFeatureEnabled(Feature.PERMIT_CONDITION_TAGS);


    const condWithoutConditionsText = defaultPermitConditionCategories?.map((cat) => {
        return {
            ...cat,
            description: cat.description.replace("Conditions", "").trim(),
        };
    });

    const featureModifyConditions = isFeatureEnabled(Feature.MODIFY_PERMIT_CONDITIONS);

    useEffect(() => {
        if (conditionTags?.length === 0 && areTagsEnabled) {
            dispatch(fetchPermitConditionTags(undefined));
        }
    }, [conditionTags]);


    const dropdownCategories = useMemo(
        () => [
            !isStandardConditions && {
                groupName: "Custom Categories",
                opt: createDropDownList(
                    currentAmendment?.condition_categories ?? [],
                    "description",
                    "condition_category_code"
                ),
            },
            {
                groupName: "Standard Categories",
                opt: createDropDownList(
                    condWithoutConditionsText,
                    "description",
                    "condition_category_code"
                ),
            },
        ].filter(Boolean),
        [currentAmendment?.condition_categories, condWithoutConditionsText]
    );

    const canEditPermitConditions = (category: IPermitConditionCategory): boolean =>
        featureModifyConditions &&
        userCanEdit && (isStandardConditions || isNowEditor ||
            userReviewCategoryCodes.includes(category.condition_category_code));

    const refreshConditionData = async () => {
        await refreshData();

        setEditingFormName(null);
    };

    const handleAddCondition = async () => {
        setAddingToCategoryCode(null);
        await refreshConditionData();
    };

    const handleClickAddCondition = (category) => {
        setAddingToCategoryCode(category.condition_category_code);
        setEditingFormName(FORM.EDIT_PERMIT_CONDITION)
    };

    const handleUpdateConditionCategory = (category: IPermitConditionCategory) => {
        setLoading(true);
        dispatch(
            updatePermitAmendmentConditionCategory(
                mineGuid,
                permitGuid,
                currentAmendment.permit_amendment_guid,
                category
            )
        ).finally(() => setLoading(false));
    };

    const handleDeleteConditionCategory = (category: IPermitConditionCategory) => {
        setLoading(true);
        dispatch(
            deletePermitAmendmentConditionCategory(
                mineGuid,
                permitGuid,
                currentAmendment?.permit_amendment_guid,
                category.condition_category_code
            )
        ).finally(() => setLoading(false));
    };

    const handleMoveCategory = (category: IPermitConditionCategory, newOrder: number) => {
        const updatedCat = {
            ...category,
            display_order: newOrder,
        };

        dispatch(
            updatePermitAmendmentConditionCategory(
                mineGuid,
                permitGuid,
                currentAmendment?.permit_amendment_guid,
                updatedCat
            )
        );
    };

    const handleMoveCondition = async (condition: IPermitCondition | IStandardPermitCondition, isMoveUp: boolean) => {
        const newOrder = isMoveUp ? condition.display_order - 1 : condition.display_order + 1;
        const updatedCond = {
            ...condition,
            display_order: newOrder,
        };

        if ("standard_permit_condition_guid" in updatedCond) {
            await dispatch(updateStandardPermitCondition(
                updatedCond.standard_permit_condition_guid,
                updatedCond
            ));

        } else {
            await dispatch(
                updatePermitCondition(
                    updatedCond.permit_condition_guid,
                    currentAmendment.permit_amendment_guid,
                    updatedCond
                )
            );
        }
        await refreshConditionData();
    };

    const renderCategory = (category, idx) => {
        return <div key={category.href} className="common-page-content">
            <Col span={24}>
                <Row justify="space-between">
                    {!collapseCategories && <Title level={3} className="margin-none" id={category.href}>
                        <EditPermitConditionCategoryInline
                            canEdit={
                                isExtracted && canEditPermitConditions(category.condition_category)
                            }
                            onDelete={handleDeleteConditionCategory}
                            onChange={handleUpdateConditionCategory}
                            moveUp={(cat) => handleMoveCategory(cat, idx - 1)}
                            moveDown={(cat) => handleMoveCategory(cat, idx + 1)}
                            currentPosition={idx}
                            categoryCount={formattedCategories.length}
                            category={category.condition_category}
                            conditionCount={category?.conditions.length || 0}
                        />
                    </Title>}
                    {canEditPermitConditions(category.condition_category) && canAddConditions && (
                        <CoreButton
                            type="primary"
                            loading={loading}
                            disabled={Boolean(addingToCategoryCode) || Boolean(editingFormName)}
                            onClick={() => handleClickAddCondition(category)}
                        >
                            Add Condition
                        </CoreButton>
                    )}
                </Row>
                {featureModifyConditions && userCanEdit && !isStandardConditions && !isNowEditor && (
                    <PermitConditionReviewAssignment category={category?.condition_category} />
                )}
            </Col>
            {category.conditions.map((sc, idx) => (
                <Col span={24} key={sc.permit_condition_id} className="fade-in">
                    <PermitConditionLayer
                        isExtracted={isExtracted}
                        permitAmendmentGuid={currentAmendment?.permit_amendment_guid}
                        condition={sc}
                        isExpanded={isExpanded}
                        handleMoveCondition={handleMoveCondition}
                        currentPosition={idx}
                        conditionCount={category.conditions.length}
                        canEditPermitConditions={canEditPermitConditions(
                            category.condition_category
                        )}
                        setEditingFormName={setEditingFormName}
                        editingFormName={editingFormName ?? addingToCategoryCode}
                        refreshData={refreshConditionData}
                        conditionSelected={setSelectedCondition}
                        categoryOptions={dropdownCategories}
                    />
                </Col>
            ))}
            {addingToCategoryCode === category.condition_category_code && (
                <Col span={24}>
                    <SubConditionForm
                        conditionCategory={category}
                        permitAmendmentGuid={currentAmendment?.permit_amendment_guid}
                        handleCancel={() => { setAddingToCategoryCode(null); setEditingFormName(null); }}
                        onSubmit={handleAddCondition}
                        categoryOptions={dropdownCategories}
                    />
                </Col>
            )}
        </div>
    }

    return (
        <div>
            <Row gutter={[16, 16]}>
                {formattedCategories.map((category, idx) => {
                    {
                        if (collapseCategories) {
                            return (
                                <Col span={24} id={category.href} key={category.href}>
                                    <Collapse
                                        key={category.href}
                                        className="light-header"
                                    >
                                        <Collapse.Panel
                                            className="permit-conditions-collapse-panel"
                                            forceRender
                                            collapsible={loading ? "disabled" : undefined}
                                            header={
                                                <Row justify="space-between">
                                                    <Col>
                                                        {category.condition_category.step} {category.condition_category.description} ({category.conditions.length})
                                                    </Col>
                                                    {loading && <Col>
                                                        <Spin indicator={<LoadingOutlined />} />
                                                    </Col>}
                                                </Row>
                                            } key={category.href}>
                                            {renderCategory(category, idx)}
                                        </Collapse.Panel>
                                    </Collapse>
                                </Col>)
                        }
                        return renderCategory(category, idx)
                    }
                })}
            </Row>
        </div>
    );
};

export default PermitConditionViewEdit;