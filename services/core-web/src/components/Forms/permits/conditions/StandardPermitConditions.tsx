import React, { FC, useEffect, useState } from "react";
import { Divider, Typography } from "antd";
import { PermitConditionsProvider } from "@mds/common/components/permits/PermitConditionsContext";
import PermitConditionViewEdit from "@mds/common/components/permits/PermitConditionViewEdit";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import { fetchStandardPermitConditions } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getIsFetching } from "@mds/common/redux/reducers/networkReducer";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getStandardPermitConditionsFormatted } from "@mds/common/redux/selectors/permitSelectors";
import { IFormattedConditionCategory, IPermitConditionTag } from "@mds/common/interfaces";
import { fetchPermitConditionTags, getPermitConditionTags } from "@mds/common/redux/slices/permitConditionTagSlice";
import { fetchStandardReportRequirements, getStandardReportRequirements } from "@mds/common/redux/slices/mineReportPermitRequirementSlice";


interface StandardPermitConditionsProps {
    type: string;
}

const TYPE_MAP = {
    "sand-and-gravel": "SAG",
    quarry: "QCA",
    exploration: "MIN",
    placer: "PLA",
}

const TEMPLATE_TYPE = {
    QCA: "Quarry",
    MIN: "MX/CX",
    PLA: "Placer",
    SAG: "Sand & Gravel",
};

const StandardPermitConditions: FC<StandardPermitConditionsProps> = ({ type }) => {
    const dispatch = useAppDispatch();
    const typeCode = TYPE_MAP[type];
    const { categoriesWithConditions } = useAppSelector(getStandardPermitConditionsFormatted());
    const conditionsLoading = useAppSelector(getIsFetching(NetworkReducerTypes.GET_PERMIT_CONDITIONS));
    const conditionsLoaded = categoriesWithConditions[0]?.conditions[0]?.notice_of_work_type === typeCode;
    const reportRequirements = useAppSelector(getStandardReportRequirements);
    const [isLoading, setIsLoading] = useState(false);
    const [editingFormName, setEditingFormName] = useState<string>();
    const [addingToCategoryCode, setAddingToCategoryCode] = useState<string>();
    // TODO: won't be necessary after NoW editor merge
    const conditionTags: IPermitConditionTag[] = useAppSelector(getPermitConditionTags);

    const showLoading = conditionsLoading || isLoading;

    // TODO: remove
    useEffect(() => {
        if (conditionTags?.length === 0) {
            dispatch(fetchPermitConditionTags(undefined));
        }
    }, [conditionTags]);

    useEffect(() => {
        if (!reportRequirements) {
            dispatch(fetchStandardReportRequirements(undefined))
        }
    }, [reportRequirements]);

    useEffect(() => {
        if (!conditionsLoaded) {
            setIsLoading(true);
            dispatch(fetchStandardPermitConditions(typeCode)).then(() => {
                setIsLoading(false);
            });
        }
    }, [typeCode]);

    const providerValue = {
        loading: showLoading,
        setLoading: setIsLoading,
        standardConditionType: typeCode,
        refreshData: () => dispatch(fetchStandardPermitConditions(typeCode))
    };

    const formattedCategories: IFormattedConditionCategory[] = categoriesWithConditions.map((cat) => {

        return {
            href: cat.condition_category_code,
            condition_category: { description: cat.description, step: cat.step },
            conditions: cat.conditions,
            condition_category_code: cat.condition_category_code,
            title: <span>{cat.description}</span>
        }
    });


    return (
        <PermitConditionsProvider value={providerValue}>
            <Typography.Title level={2}>
                {TEMPLATE_TYPE[typeCode]} Template Permit Conditions
            </Typography.Title>
            <Divider />
            <PermitConditionViewEdit
                userCanEdit={true}
                formattedCategories={formattedCategories}
                collapseCategories
                editingFormName={editingFormName}
                setEditingFormName={setEditingFormName}
                addingToCategoryCode={addingToCategoryCode}
                setAddingToCategoryCode={setAddingToCategoryCode}
            />
        </PermitConditionsProvider>
    );
};

export default StandardPermitConditions;