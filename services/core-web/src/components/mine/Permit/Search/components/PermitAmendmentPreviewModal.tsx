import React, { useEffect } from 'react';
import { Spin } from 'antd';
import PermitConditions from '../../PermitConditions';
import { useAppDispatch, useAppSelector } from '@mds/common/redux/rootState';
import { fetchPermits } from '@mds/common/redux/actionCreators/permitActionCreator';
import { getAmendment } from '@mds/common/redux/selectors/permitSelectors';

interface Props {
    onCancel: () => void;
    permitAmendmentGuid: string;
    mineGuid: string;
    permitGuid: string;
    selectedConditionId: string;
}

const PermitAmendmentPreviewModal: React.FC<Props> = ({
    onCancel,
    permitAmendmentGuid,
    mineGuid,
    permitGuid,
    selectedConditionId,
}) => {
    const dispatch = useAppDispatch();
    const currentAmendment = useAppSelector(state => getAmendment(permitGuid, permitAmendmentGuid)(state));

    useEffect(() => {
        dispatch(fetchPermits(mineGuid));
    }, [mineGuid, dispatch]);

    return (
        currentAmendment ?
            <PermitConditions
                mineGuid={mineGuid}
                permitGuid={permitGuid}
                forceViewConditions
                currentAmendment={currentAmendment}
                latestAmendment={currentAmendment}
                previousAmendment={currentAmendment}
                isReviewComplete={true}
                isExtracted={true}
                userCanEdit={false}
                canStartExtraction={false}
                selectedConditionId={selectedConditionId} // Add this line
            /> : <Spin size='large' />

    );
};

export default PermitAmendmentPreviewModal;
