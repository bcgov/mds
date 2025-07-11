import { fetchStandardPermitConditions } from "@mds/common/redux/actionCreators/permitActionCreator";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getStandardPermitConditions } from "@mds/common/redux/selectors/permitSelectors";
import React, { FC, useEffect, useState } from "react";

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

    const standardPermitConditions = useAppSelector(getStandardPermitConditions);
    const conditionsLoaded = standardPermitConditions[0]?.notice_of_work_type === typeCode;
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!conditionsLoaded) {
            setIsLoading(true);
            dispatch(fetchStandardPermitConditions(typeCode)).then(() => {
                setIsLoading(false);
            });
        }

    }, [typeCode])


    return (<div>{type} standard permit conditions</div>);
};

export default StandardPermitConditions;