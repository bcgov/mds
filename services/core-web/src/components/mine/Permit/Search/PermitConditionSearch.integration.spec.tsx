import userEvent from '@testing-library/user-event'
import PermitConditionSearch from './PermitConditionSearch';
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { ReduxWrapper } from '@mds/common/tests/utils/ReduxWrapper';
jest.mock('react-markdown');


describe('PermitConditionSearch Integration Tests', () => {

    it('shows splash screen initially', () => {
        render(<ReduxWrapper><PermitConditionSearch /></ReduxWrapper>);
        expect(screen.getByText('Search Permit Conditions')).toBeInTheDocument();
        expect(screen.getByText('Try these example searches')).toBeInTheDocument();
    });

    it('performs search when clicking example query', async () => {
        render(<ReduxWrapper><PermitConditionSearch /></ReduxWrapper>);

        const waterQuery = screen.getByText(
            'How must the Permittee monitor water quality and quantity on the mine site?'
        );
        await userEvent.click(waterQuery);

        await waitFor(() => {
            expect(screen.getByText('Water quality monitoring must be conducted monthly')).toBeInTheDocument();
        });
    });

    it('shows and applies filters', async () => {
        const { container } = render(<ReduxWrapper><PermitConditionSearch /></ReduxWrapper>);

        // Perform initial search
        const searchBox = screen.getByRole('textbox');
        await userEvent.type(searchBox, 'water quality{enter}');

        // Wait for results
        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument();
        });

        // Open filters
        await userEvent.click(screen.getByText('Filters'));

        // Select a filter
        const envFilter = screen.getByTestId('filter-checkbox-category-Environmental');
        await userEvent.click(envFilter);

        // Apply filters
        const applyButton = screen.getByText('Apply Filters');
        await userEvent.click(applyButton);

        // Verify filter tag appears
        expect(screen.getByText('category: Environmental')).toBeInTheDocument();

        expect(container).toMatchSnapshot();
    });

    it('clears filters properly', async () => {
        render(<ReduxWrapper><PermitConditionSearch /></ReduxWrapper>);

        // Perform search and apply filter first
        await userEvent.type(screen.getByRole('textbox'), 'water quality{enter}');
        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument();
        });


        // Apply filters
        await userEvent.click(screen.getByText('Filters'));
        const envFilter = screen.getByTestId('filter-checkbox-category-Environmental');
        await userEvent.click(envFilter);

        await userEvent.click(screen.getByText('Apply Filters'));


        // Clear filters
        const clearButton = screen.getByText('Clear All');
        await userEvent.click(clearButton);

        await waitFor(async () => {

            await userEvent.click(screen.getByText('Apply Filters'));
        })

        // Verify filter tag is removed
        expect(screen.queryByText('category: Environmental')).not.toBeInTheDocument();
    });

    it('shows AI-generated responses', async () => {
        render(<ReduxWrapper><PermitConditionSearch /></ReduxWrapper>);

        await userEvent.type(screen.getByRole('textbox'), 'water quality{enter}');

        await waitFor(() => {
            expect(screen.getByText('The permit requires monthly water quality monitoring.')).toBeInTheDocument();
        });
    });
});
