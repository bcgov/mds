import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ComparePermitConditionHistoryModal, { ComparePermitConditionHistoryModalProps } from '@/components/mine/Permit/ComparePermitConditionHistoryModal';
import { ReduxWrapper } from '@mds/common/tests/utils/ReduxWrapper';
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

// Mock child components
jest.mock('@/components/mine/Permit/ConditionDiffViewer', () => ({
    __esModule: true,
    default: () => <div data-testid="condition-diff-viewer">Condition Diff Viewer</div>
}));

jest.mock('@/components/mine/Permit/PermitConditionReportRequirements', () => ({
    __esModule: true,
    default: () => <div data-testid="report-requirements">Report Requirements</div>
}));

describe('ComparePermitConditionHistoryModal', () => {

    const defaultProps: ComparePermitConditionHistoryModalProps = {
        mineGuid: 'test-mine-guid',
        permitGuid: 'test-permit-guid',
        currentAmendmentCondition: MOCK.PERMITS[0].permit_amendments[0].conditions[0],
        previousAmendmentCondition: MOCK.PERMITS[0].permit_amendments[1].conditions[0],
        latestAmendment: MOCK.PERMITS[0].permit_amendments[0],
        previousAmendment: MOCK.PERMITS[0].permit_amendments[1]
    };

    it('renders the modal with title', () => {
        render(
            <ReduxWrapper>
                <ComparePermitConditionHistoryModal {...defaultProps} />
            </ReduxWrapper>
        );

        expect(screen.getByText('Compare Conditions')).toBeInTheDocument();
    });

    it('renders condition diff viewer', () => {
        render(
            <ReduxWrapper>
                <ComparePermitConditionHistoryModal {...defaultProps} />
            </ReduxWrapper>
        );

        expect(screen.getByTestId('condition-diff-viewer')).toBeInTheDocument();
    });

    it('renders report requirements for both versions', () => {
        render(
            <ReduxWrapper>
                <ComparePermitConditionHistoryModal {...defaultProps} />
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
            <ReduxWrapper>
                <ComparePermitConditionHistoryModal {...propsWithoutPrevious} />
            </ReduxWrapper>
        );

        expect(screen.getByTestId('condition-diff-viewer')).toBeInTheDocument();
    });
});