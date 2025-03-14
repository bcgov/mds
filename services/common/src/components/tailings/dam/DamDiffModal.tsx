import React, { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { fetchDamHistory, getDamByGuid } from "@mds/common/redux/slices/damSlice";
import DiffTable from "../../history/DiffTable";
import { CONSEQUENCE_CLASSIFICATION_CODE_HASH, DAM_OPERATING_STATUS_HASH, DAM_TYPES_HASH } from "@mds/common/constants/strings";
import { formatDateTimeUserTz } from "@mds/common/redux/utils/helpers";

interface DamDiffModalProps {
    damGuid: string;
}

const DamDiffModal: FC<DamDiffModalProps> = ({ damGuid }) => {
    const dispatch = useAppDispatch();
    const dam = useAppSelector(getDamByGuid(damGuid));
    const [loading, setLoading] = useState(false);

    const fetchData = () => {
        setLoading(true);
        dispatch(fetchDamHistory(damGuid)).then(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!dam?.history && !loading) {
            fetchData();
        }
    }, [dam?.history]);

    const dateTransform = { transform: (dateString: string) => formatDateTimeUserTz(dateString) || null };

    const valueMapper = {
        dam_type: { hash: DAM_TYPES_HASH },
        operating_status: { hash: DAM_OPERATING_STATUS_HASH },
        consequence_classification: { hash: CONSEQUENCE_CLASSIFICATION_CODE_HASH },
        create_timestamp: dateTransform,
        update_timestamp: dateTransform,
    };

    return <DiffTable history={dam?.history} loading={loading} valueMapper={valueMapper} />
};

export default DamDiffModal;