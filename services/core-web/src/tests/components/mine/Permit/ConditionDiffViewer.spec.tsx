import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ReduxWrapper } from '@mds/common/tests/utils/ReduxWrapper';
import * as MOCK from '@mds/common/tests/mocks/dataMocks';
import { IPermitConditionChangeType } from '@mds/common/interfaces';
import ConditionDiffViewer from '@/components/mine/Permit/ConditionDiffViewer';

const mockDispatch = jest.fn();
jest.mock('@mds/common/redux/rootState', () => ({
    ...jest.requireActual('@mds/common/redux/rootState'),
    useAppDispatch: () => mockDispatch
}));

describe('ConditionDiffViewer', () => {
    const mockProps = {
        currentCondition: MOCK.PERMITS[0].permit_amendments[0].conditions[0],
        previousCondition: MOCK.PERMITS[0].permit_amendments[0].conditions[0],
        mineGuid: MOCK.PERMITS[0].mine_guid,
        permitGuid: MOCK.PERMITS[0].permit_guid,
        latestAmendment: MOCK.PERMITS[0].permit_amendments[0],
        previousAmendment: MOCK.PERMITS[0].permit_amendments[0]
    };

    const mockDiffs = [{
        condition_guid: mockProps.currentCondition.permit_condition_guid,
        previous_condition_guid: mockProps.previousCondition.permit_condition_guid,
        change_type: IPermitConditionChangeType.MODIFIED
    }];

    const initialState = {
        permitConditionDiff: {
            diffs: {
                [mockProps.latestAmendment.permit_amendment_guid]: mockDiffs
            }
        }
    };

    it('renders loading state initially', () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <ConditionDiffViewer {...mockProps} />
            </ReduxWrapper>
        );

        expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
    });

    it('renders both previous and current versions', async () => {
        const { getByText } = render(
            <ReduxWrapper initialState={initialState}>
                <ConditionDiffViewer {...mockProps} />
            </ReduxWrapper>
        );

        await waitFor(() => {
            expect(getByText('Previous Version')).toBeInTheDocument();
            expect(getByText('Current Version')).toBeInTheDocument();
        });
    });

    it('fetches diff data on mount', async () => {
        render(
            <ReduxWrapper initialState={initialState}>
                <ConditionDiffViewer {...mockProps} />
            </ReduxWrapper>
        );

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    it('applies correct class for modified conditions', async () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <ConditionDiffViewer {...mockProps} />
            </ReduxWrapper>
        );

        await waitFor(() => {
            expect(container.querySelector('.condition-modified')).toBeInTheDocument();
        });
    });

    it('applies correct class for unchanged conditions', async () => {
        const unchangedDiffs = [{
            condition_guid: mockProps.currentCondition.permit_condition_guid,
            previous_condition_guid: mockProps.previousCondition.permit_condition_guid,
            change_type: IPermitConditionChangeType.UNCHANGED
        }];

        const stateWithUnchanged = {
            permitConditionDiff: {
                diffs: {
                    [mockProps.latestAmendment.permit_amendment_guid]: unchangedDiffs
                }
            }
        };

        const { container } = render(
            <ReduxWrapper initialState={stateWithUnchanged}>
                <ConditionDiffViewer {...mockProps} />
            </ReduxWrapper>
        );

        await waitFor(() => {
            expect(container.querySelector('.condition-unchanged')).toBeInTheDocument();
            expect(container).toMatchSnapshot();
        });
    });

    it('applies correct class for moved conditions', async () => {
        const movedDiffs = [{
            condition_guid: mockProps.currentCondition.permit_condition_guid,
            previous_condition_guid: mockProps.previousCondition.permit_condition_guid,
            change_type: IPermitConditionChangeType.MOVED
        }];

        const stateWithMoved = {
            permitConditionDiff: {
                diffs: {
                    [mockProps.latestAmendment.permit_amendment_guid]: movedDiffs
                }
            }
        };

        const { container } = render(
            <ReduxWrapper initialState={stateWithMoved}>
                <ConditionDiffViewer {...mockProps} />
            </ReduxWrapper>
        );

        await waitFor(() => {
            expect(container.querySelector('.condition-moved')).toBeInTheDocument();
        });
    });

    it('displays condition steps correctly', async () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <ConditionDiffViewer {...mockProps} />
            </ReduxWrapper>
        );

        await waitFor(() => {
            const stepColumns = container.getElementsByClassName('step-column');
            expect(stepColumns.length).toBeGreaterThan(0);
        });
    });

});