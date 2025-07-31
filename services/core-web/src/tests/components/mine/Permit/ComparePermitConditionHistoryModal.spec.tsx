import React from 'react';
import { render, screen } from '@testing-library/react';
import ComparePermitConditionHistoryModal, { ComparePermitConditionHistoryModalProps } from '@mds/common/components/permits/ComparePermitConditionHistoryModal';
import { ReduxWrapper } from '@mds/common/tests/utils/ReduxWrapper';
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { PermitConditionsProvider } from '@mds/common/components/permits/PermitConditionsContext';
import { PERMITS } from '@mds/common/constants/reducerTypes';

// Mock child components
jest.mock('@mds/common/components/permits/ConditionDiffViewer', () => ({
    __esModule: true,
    default: () => <div data-testid="condition-diff-viewer">Condition Diff Viewer</div>
}));

jest.mock('@mds/common/components/permits/PermitConditionReportRequirements', () => ({
    __esModule: true,
    default: () => <div data-testid="report-requirements">Report Requirements</div>
}));

describe('ComparePermitConditionHistoryModal', () => {

    const initialState = {
        [PERMITS]: { permits: MOCK.PERMITS }
    }

    const providerValues = {
        mineGuid: MOCK.PERMITS[0].mine_guid,
        permitGuid: MOCK.PERMITS[0].permit_guid,
        latestAmendment: MOCK.PERMITS[0].permit_amendments[0],
        currentAmendment: MOCK.PERMITS[0].permit_amendments[0],
        previousAmendment: MOCK.PERMITS[0].permit_amendments[1],
        loading: false,
        setLoading: jest.fn(),
        refreshData: jest.fn(),
    };

    const defaultProps: ComparePermitConditionHistoryModalProps = {
        currentAmendmentCondition: MOCK.PERMITS[0].permit_amendments[0].conditions[0],
        previousAmendmentCondition: MOCK.PERMITS[0].permit_amendments[1].conditions[0],
    };

    it('renders the modal with title', () => {
        render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider
                    value={providerValues}
                >
                    <ComparePermitConditionHistoryModal
                        currentAmendmentCondition={MOCK.PERMITS[0].permit_amendments[0].conditions[0]}
                        previousAmendmentCondition={MOCK.PERMITS[0].permit_amendments[1].conditions[0]}
                    />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        expect(screen.getByText('Compare Conditions')).toBeInTheDocument();
    });

    it('renders condition diff viewer', () => {
        render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider
                    value={providerValues}
                >
                    <ComparePermitConditionHistoryModal {...defaultProps} />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        expect(screen.getByTestId('condition-diff-viewer')).toBeInTheDocument();
    });

    it('renders report requirements for both versions', () => {
        render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider
                    value={providerValues}
                >
                    <ComparePermitConditionHistoryModal {...defaultProps} />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        const reportRequirements = screen.getAllByTestId('report-requirements');
        expect(reportRequirements).toHaveLength(2);
    });

    it('handles missing previous amendment', () => {
        const propsWithoutPrevious = {
            ...defaultProps,
            previousAmendment: undefined,
            previousAmendmentCondition: undefined
        };

        render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider
                    value={{ ...providerValues, previousAmendment: null }}
                >
                    <ComparePermitConditionHistoryModal {...propsWithoutPrevious} />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        expect(screen.getByTestId('condition-diff-viewer')).toBeInTheDocument();
    });
});