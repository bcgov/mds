import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NowApplicationDocumentSearch from './NowApplicationDocumentSearch';
import nowApplicationSearchReducer from '@mds/common/redux/slices/nowApplicationSearchSlice';

// Mock dependencies
jest.mock('@mds/common/redux/customAxios', () => {
    return jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ data: { status: 'never_run' } }),
        post: jest.fn().mockResolvedValue({ data: {} }),
        delete: jest.fn().mockResolvedValue({ data: {} }),
    }));
});

jest.mock('@/components/mine/Permit/Search/components/SearchBox', () => () => <div data-testid="mock-search-box">SearchBox</div>);
jest.mock('@/components/mine/Permit/Search/components/SearchResults', () => () => <div data-testid="mock-search-results">SearchResults</div>);
jest.mock('@/components/mine/Permit/Search/components/MarkdownViewer', () => () => <div data-testid="mock-markdown-viewer">MarkdownViewer</div>);
jest.mock('./NowApplicationDocumentSearchSplashScreen', () => () => <div data-testid="mock-splash-screen">SplashScreen</div>);

const createMockStore = (preloadedState = {}) => {
    return configureStore({
        reducer: {
            nowApplicationSearch: nowApplicationSearchReducer,
        },
        preloadedState: {
            nowApplicationSearch: {
                results: null,
                loading: false,
                documentLoading: false,
                aiLoading: false,
                indexing: false,
                cancelling: false,
                indexerStatus: null,
                indexerStatusLoading: false,
                query: '',
                filters: [],
                allFacets: {},
                nowApplicationGuid: null,
                ...preloadedState,
            },
        },
    });
};

describe('NowApplicationDocumentSearch', () => {
    it('renders splash screen initially when no query or filters exist', async () => {
        const store = createMockStore();
        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('mock-splash-screen')).toBeInTheDocument();
        });
    });

    it('renders main search view when query exists', async () => {
        const store = createMockStore({ query: 'test' });
        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        expect(screen.getByText('Application Document Search')).toBeInTheDocument();
        expect(screen.getByTestId('mock-search-box')).toBeInTheDocument();
        expect(screen.getByTestId('mock-search-results')).toBeInTheDocument();
    });

    it('renders main search view when filters exist', async () => {
        const store = createMockStore({ filters: [{ category: 'Type', value: 'PDF' }] });
        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        expect(screen.getByText('Application Document Search')).toBeInTheDocument();
    });

    it('shows index button and handles index click', async () => {
        const store = createMockStore({ indexerStatus: { status: 'never_run' } });
        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        const indexBtn = await screen.findByText('Index Documents');
        expect(indexBtn).toBeInTheDocument();
        
        fireEvent.click(indexBtn);
    });

    it('shows re-index button and handles popconfirm', async () => {
        const store = createMockStore({ indexerStatus: { status: 'success' } });
        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        const indexBtn = await screen.findByText('Re-Index Documents');
        expect(indexBtn).toBeInTheDocument();
    });

    it('shows cancel indexing when running', async () => {
        const store = createMockStore({ indexerStatus: { status: 'running', percent: 50 } });
        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        const cancelBtn = await screen.findByText('Cancel Indexing');
        expect(cancelBtn).toBeInTheDocument();
    });

    it('toggles AI response expansion', async () => {
        const store = createMockStore({ query: 'test', results: { prompt: { answers: ['test answer'] } } });
        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        const expandBtn = screen.getByTitle('Expand');
        fireEvent.click(expandBtn);
        
        expect(screen.getByTitle('Compress')).toBeInTheDocument();
    });
});
