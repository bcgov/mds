import { IPermit } from "@mds/common/interfaces/permits";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getPermitByGuid } from "@mds/common/redux/selectors/permitSelectors";
import { Redirect, useParams } from "react-router-dom";
import React, { FC, useEffect } from "react";

import { VIEW_MINE_PERMIT_AMENDMENT } from "@/constants/routes";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";

const ViewPermitRedirect: FC = () => {
    const { id: mineGuid, permitGuid, tab } = useParams<{ id: string; permitGuid: string; tab: string }>();
    const permit: IPermit = useAppSelector(getPermitByGuid(permitGuid));
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (!permit?.permit_id) {
            dispatch(fetchPermits(mineGuid));
        }
    }, [permit]);


    if (permit) {
        return <Redirect to={VIEW_MINE_PERMIT_AMENDMENT.dynamicRoute(mineGuid, permitGuid, permit.permit_amendments[0].permit_amendment_guid, tab)} />;
    }

    return <></>;
}

export default ViewPermitRedirect;
