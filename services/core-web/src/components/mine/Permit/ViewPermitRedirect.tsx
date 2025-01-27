import { IPermit } from "@mds/common/interfaces/permits";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getPermitByGuid } from "@mds/common/redux/selectors/permitSelectors";
import { Redirect, useParams } from "react-router-dom";
import React, { FC, useEffect } from "react";

import { VIEW_MINE_PERMIT_AMENDMENT } from "@/constants/routes";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";

/**
 * Component that redirects from a permit view to a view of the latest permit amendment.
 * Why? We need to be able to view a top level view of different permit amendments,
 * but able to redirected to the latest amendment when linked to from elsewhere in the app.
 */
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
