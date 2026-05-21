import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SearchResults from '../components/SearchResults';

const mockStore = configureStore([]);

jest.mock('../components/ResultItem', () => () => <div data-testid="default-result-item" />);
jest.mock('../components/FilterDrawer', () => () => <div data-testid="filter-drawer" />);

describe('SearchResults', () => {
    const defaultResults = {
        documents: [{ id: '1', content: 'test content' }],
        prompt: null
    };

    const setup = (props = {}) => {
        const store = mockStore({
            permitSearch: {
                results: defaultResults,
                filters: [],
                query: '',
                documentLoading: false,
                allFacets: {}
            }
        });
        const onFilterChange = jest.fn();

        return {
            ...render(
                <Provider store={store}>
                    <SearchResults onFilterChange={onFilterChange} {...props} />
                </Provider>
            ),
            store,
            onFilterChange
        };
    };

    it('renders with default selectors and default result item', () => {
        setup();
        expect(screen.getByTestId('default-result-item')).toBeInTheDocument();
    });

    it('renders with custom renderItem', () => {
        const renderItem = jest.fn().mockReturnValue(<div data-testid="custom-result-item" />);
        setup({ renderItem });
        expect(screen.getByTestId('custom-result-item')).toBeInTheDocument();
        expect(screen.queryByTestId('default-result-item')).not.toBeInTheDocument();
    });

    it('renders with custom selectors', () => {
        const customResults = {
            documents: [{ id: 'custom-1', content: 'custom content' }],
            prompt: null
        };
        const selectors = {
            selectResults: jest.fn().mockReturnValue(customResults),
            selectFilters: jest.fn().mockReturnValue([]),
            selectQuery: jest.fn().mockReturnValue(''),
            selectDocumentLoading: jest.fn().mockReturnValue(false),
            selectAllFacets: jest.fn().mockReturnValue({})
        };

        setup({ selectors });

        expect(selectors.selectResults).toHaveBeenCalled();
        // Since we mocked ResultItem, we just check if it was called (implicitly via render)
        // or we can check if the store was bypassed if we used a more complex mock
    });

    it('shows loading state when documentLoading is true', () => {
        const selectors = {
            selectResults: jest.fn().mockReturnValue(null),
            selectFilters: jest.fn().mockReturnValue([]),
            selectQuery: jest.fn().mockReturnValue(''),
            selectDocumentLoading: jest.fn().mockReturnValue(true),
            selectAllFacets: jest.fn().mockReturnValue({})
        };
        setup({ selectors });
        // antd Skeleton should be present
        expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
    });
});
