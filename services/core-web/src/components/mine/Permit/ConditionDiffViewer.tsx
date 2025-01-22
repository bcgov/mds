import React, { FC, useEffect } from 'react';
import { Row, Col, Typography } from 'antd';
import { IPermitAmendment, IPermitCondition, IPermitConditionChangeType } from '@mds/common/interfaces';
import { formatPermitConditionStep } from '@mds/common/utils/helpers';
import {
    fetchPermitConditionDiff,
    getPermitConditionDiff,
} from '@mds/common/redux/slices/permitConditionDiffSlice';
import { useAppDispatch, useAppSelector } from '@mds/common/redux/rootState';

interface Props {
    currentCondition: IPermitCondition;
    previousCondition: IPermitCondition;
    mineGuid: string;
    permitGuid: string;
    latestAmendment: IPermitAmendment;
}

const ConditionDiffViewer: FC<Props> = ({
    currentCondition,
    previousCondition,
    mineGuid,
    permitGuid,
    latestAmendment
}) => {
    const dispatch = useAppDispatch();

    const diffs = useAppSelector(state => getPermitConditionDiff(state, latestAmendment?.permit_amendment_guid));

    useEffect(() => {
        dispatch(fetchPermitConditionDiff({ mineGuid, permitGuid, amendmentGuid: latestAmendment?.permit_amendment_guid }));
    }, [mineGuid, permitGuid, latestAmendment?.permit_amendment_guid]);

    const getComparisonForCondition = (conditionGuid: string) => {
        return diffs?.find(diff => diff.condition_guid === conditionGuid);
    };

    const renderCondition = (condition: IPermitCondition, isPrevious: boolean = false, level = 0) => {
        const comparison = getComparisonForCondition(condition.permit_condition_guid);

        const getChangeClass = () => {
            if (!comparison) return 'condition-unchanged';
            if (isPrevious && comparison.change_type !== IPermitConditionChangeType.UNCHANGED) {
                return 'condition-removed';
            }
            return `condition-${comparison.change_type.toLowerCase()}`;
        };

        return (
            <>
                <div className={getChangeClass()}>
                    <div className="condition-text" style={{ marginLeft: `${level * 20}px` }}>
                        <Row wrap={false} align="top" className="condition-content">
                            <Col className="step-column" style={{ flexShrink: 0 }}>
                                <Typography.Text className="view-item-value">
                                    {formatPermitConditionStep(condition.step)} &nbsp;
                                </Typography.Text>
                            </Col>
                            <Col className="condition-column">
                                <Typography.Text className="view-item-value">
                                    {condition.condition}
                                </Typography.Text>
                            </Col>
                        </Row>
                        {comparison && comparison.change_type === IPermitConditionChangeType.MODIFIED && (
                            <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                                ({Math.round(comparison.text_similarity * 100)}% match)
                            </Typography.Text>
                        )}
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