import userEvent from '@testing-library/user-event'
import PermitConditionSearch from './PermitConditionSearch';
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { ReduxWrapper } from '@mds/common/tests/utils/ReduxWrapper';

jest.mock('@mds/common/redux/customAxios', () => {
    const originalModule = jest.requireActual('@mds/common/redux/customAxios');

    return {
        __esModule: true,
        default: jest.fn().mockImplementation((...args) => {
            const axiosInstance = originalModule.default(...args);
            const originalPost = axiosInstance.post;
            axiosInstance.post = jest.fn((url, data, config) => {
                // Encountered an issue where the msw handlers in handlers.ts rejects
                // <API_URL> as an invalid url when used with the `fetch` adapter,
                // So, we're using localhost for this test instead to provide a valid url.
                if (url.includes('<API_URL>/search/permit-conditions')) {
                    return originalPost('http://localhost/search/permit-conditions', data, config);
                }
                return originalPost(url, data, config);
            });

            return axiosInstance;
        })
    };
});

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

        const searchBox = screen.getByRole('textbox');
        await userEvent.type(searchBox, 'water quality{enter}');

        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('Filters'));

        const envFilter = screen.getByTestId('filter-checkbox-category-Environmental');
        await userEvent.click(envFilter);

        const applyButton = screen.getByText('Apply Filters');
        await userEvent.click(applyButton);

        await waitFor(() => {
            expect(screen.getByText('Category: Environmental')).toBeInTheDocument();
        });

        expect(container).toMatchSnapshot();
    });

    it('clears filters properly', async () => {
        render(<ReduxWrapper><PermitConditionSearch /></ReduxWrapper>);

        await userEvent.type(screen.getByRole('textbox'), 'water quality{enter}');
        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('Filters'));
        const envFilter = screen.getByTestId('filter-checkbox-category-Environmental');
        await userEvent.click(envFilter);

        await userEvent.click(screen.getByText('Apply Filters'));

        const clearButton = screen.getByText('Clear All');
        await userEvent.click(clearButton);

        await waitFor(async () => {

            await userEvent.click(screen.getByText('Apply Filters'));
        })

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
