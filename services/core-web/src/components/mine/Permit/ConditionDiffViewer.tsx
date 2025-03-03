import React, { FC, useEffect, useState } from 'react';
import { Row, Col, Typography, Skeleton } from 'antd';
import { IPermitAmendment, IPermitCondition, IPermitConditionChangeType, IPermitConditionComparison } from '@mds/common/interfaces';
import { findCondition, formatPermitConditionStep } from '@mds/common/utils/helpers';
import {
    fetchPermitConditionDiff,
    getPermitConditionDiff,
} from '@mds/common/redux/slices/permitConditionDiffSlice';
import { useAppDispatch, useAppSelector } from '@mds/common/redux/rootState';
import DiffText from './DiffText';

interface Props {
    currentCondition: IPermitCondition;
    previousCondition: IPermitCondition;
    mineGuid: string;
    permitGuid: string;
    latestAmendment: IPermitAmendment;
    previousAmendment?: IPermitAmendment;
}

/**
 * A component that displays the diff between two permit conditions and their sub-conditions in a side-by-side view.
 */
const ConditionDiffViewer: FC<Props> = ({
    currentCondition,
    previousCondition,
    mineGuid,
    permitGuid,
    latestAmendment,
    previousAmendment,
}) => {
    const dispatch = useAppDispatch();

    const diffs: IPermitConditionComparison[] = useAppSelector(state => getPermitConditionDiff(state, latestAmendment?.permit_amendment_guid));

    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        (async () => {
            try {
                await dispatch(fetchPermitConditionDiff({ mineGuid, permitGuid, amendmentGuid: latestAmendment?.permit_amendment_guid, permitConditionGuid: currentCondition.permit_condition_guid }));
            } finally {
                setIsLoading(false);
            }
        })();

    }, [mineGuid, permitGuid, latestAmendment?.permit_amendment_guid]);

    const getComparisonForCondition = (conditionGuid: string) => {
        return diffs?.find(diff => diff?.condition_guid === conditionGuid);
    };

    const getComparisonForPreviousCondition = (conditionGuid: string) => {
        return diffs?.find(diff => diff.previous_condition_guid === conditionGuid);
    };

    /**
     * Render the condition and its sub-conditions recursively.
     * Highlights the condition based on whether it was added, removed, or modified.
     * If the condition was modified, shows the textual diff between the old and new condition text.
     */
    const renderCondition = (condition: IPermitCondition, isPrevious: boolean = false, level = 0) => {

        if (isLoading) {
            return <Skeleton active />;
        }

        const comparison = isPrevious
            ? getComparisonForPreviousCondition(condition?.permit_condition_guid)
            : getComparisonForCondition(condition?.permit_condition_guid);

        const getChangeClass = () => {
            if (!comparison) {
                return isPrevious ? 'condition-removed' : 'condition-unchanged';
            }

            if (isPrevious) {
                switch (comparison.change_type) {
                    case IPermitConditionChangeType.MODIFIED:
                    case IPermitConditionChangeType.MOVED:
                        return `condition-${comparison.change_type.toLowerCase()}`;
                    default:
                        return 'condition-unchanged';
                }
            }

            return `condition-${comparison.change_type.toLowerCase()}`;
        };

        // Find related condition for diff text
        const relatedCondition = isPrevious
            ? findCondition(comparison?.condition_guid || '', currentCondition.sub_conditions || [])
            : findCondition(comparison?.previous_condition_guid || '', previousAmendment?.conditions || []);

        return (
            <>
                <div className={getChangeClass()}>
                    <div className="condition-text" style={{ marginLeft: `${level * 20}px`, marginBottom: '8px' }}>
                        <Row wrap={false} align="top" className="condition-content">
                            <Col className="step-column" style={{ flexShrink: 0 }}>
                                <Typography.Text className="view-item-value">
                                    {formatPermitConditionStep(condition.step)} &nbsp;
                                </Typography.Text>
                            </Col>
                            <Col className="condition-column">
                                {[IPermitConditionChangeType.MODIFIED, IPermitConditionChangeType.MOVED].includes(comparison?.change_type) ? (
                                    <DiffText
                                        oldText={relatedCondition?.condition || ''}
                                        newText={condition.condition}
                                    />
                                ) : (
                                    <Typography.Text className="view-item-value">
                                        {condition.condition}
                                    </Typography.Text>
                                )}
                            </Col>
                        </Row>
                    </div>
                </div>
                {condition.sub_conditions?.map((sub) => renderCondition(sub, isPrevious, level + 1))}
            </>
        );
    };
    return (
        <div className="diff-container">
            <Row gutter={16}>
                <Col span={12}>
                    <Typography.Title level={4}>Previous Version</Typography.Title>
                    {renderCondition(previousCondition, true)}
                </Col>
                <Col span={12}>
                    <Typography.Title level={4}>Current Version</Typography.Title>
                    {renderCondition(currentCondition)}
                </Col>
            </Row>
        </div>
    );
};

export default ConditionDiffViewer;