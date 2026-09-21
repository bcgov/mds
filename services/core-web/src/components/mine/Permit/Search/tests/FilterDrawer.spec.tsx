import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import FilterDrawer from '../components/FilterDrawer';

const mockStore = configureStore([]);

describe('FilterDrawer', () => {
    const defaultFacets = {
        category: [{ value: 'Environmental', count: 5 }]
    };

    const setup = (props = {}) => {
        const store = mockStore({
            permitSearch: {
                allFacets: defaultFacets
            }
        });
        const onApplyFilters = jest.fn();
        const onClearFilters = jest.fn();
        const onFilterChange = jest.fn();

        return {
            ...render(
                <Provider store={store}>
                    <FilterDrawer
                        visible={true}
                        onClose={jest.fn()}
                        pendingFilters={[]}
                        selectedFilters={[]}
                        onFilterChange={onFilterChange}
                        onApplyFilters={onApplyFilters}
                        onClearFilters={onClearFilters}
                        hasFilterChanges={false}
                        {...props}
                    />
                </Provider>
            ),
            store,
            onApplyFilters,
            onClearFilters,
            onFilterChange
        };
    };

    it('renders with default facets from redux', () => {
        setup();
        expect(screen.getByText('Environmental')).toBeInTheDocument();
    });

    it('renders with overridden facets', () => {
        const overriddenFacets = {
            category: [{ value: 'Overridden', count: 10 }]
        };
        const selectAllFacetsOverride = jest.fn().mockReturnValue(overriddenFacets);

        setup({ selectAllFacetsOverride });

        expect(screen.getByText('Overridden')).toBeInTheDocument();
        expect(screen.queryByText('Environmental')).not.toBeInTheDocument();
    });

    it('calls onApplyFilters when button clicked', () => {
        const { onApplyFilters } = setup({ hasFilterChanges: true });
        fireEvent.click(screen.getByText('Apply Filters'));
        expect(onApplyFilters).toHaveBeenCalled();
    });

    it('calls onClearFilters when button clicked', () => {
        const { onClearFilters } = setup();
        fireEvent.click(screen.getByText('Clear All'));
        expect(onClearFilters).toHaveBeenCalled();
    });
});
