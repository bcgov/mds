import React, { FC, useEffect } from 'react';
import { Row, Col, Typography } from 'antd';
import { IPermitAmendment, IPermitCondition, IPermitConditionChangeType, IPermitConditionComparison } from '@mds/common/interfaces';
import { formatPermitConditionStep } from '@mds/common/utils/helpers';
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

    useEffect(() => {
        dispatch(fetchPermitConditionDiff({ mineGuid, permitGuid, amendmentGuid: latestAmendment?.permit_amendment_guid }));
    }, [mineGuid, permitGuid, latestAmendment?.permit_amendment_guid]);

    const getComparisonForCondition = (conditionGuid: string) => {
        return diffs?.find(diff => diff?.condition_guid === conditionGuid);
    };

    const getComparisonForPreviousCondition = (conditionGuid: string) => {
        return diffs?.find(diff => diff.previous_condition_guid === conditionGuid);
    };

    const findCondition = (permit_condition_guid: string, conditions: IPermitCondition[]) => {
        const findConditionRecursive = (guid: string, condition: IPermitCondition): IPermitCondition | null => {
            if (condition?.permit_condition_guid === guid) {
                return condition;
            }

            if (condition.sub_conditions) {
                for (const sub of condition.sub_conditions) {
                    const found = findConditionRecursive(guid, sub);
                    if (found) return found;
                }
            }
            return null;
        };

        for (const condition of conditions) {
            const found = findConditionRecursive(permit_condition_guid, condition);
            if (found) return found;
        }
        return null;
    }

    const renderCondition = (condition: IPermitCondition, isPrevious: boolean = false, level = 0) => {
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
                                {comparison?.change_type === IPermitConditionChangeType.MODIFIED ? (
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