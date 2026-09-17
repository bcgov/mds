import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NowApplicationDocumentSearch from './NowApplicationDocumentSearch';
import nowApplicationSearchReducer from '@mds/common/redux/slices/nowApplicationSearchSlice';
import customAxios from '@mds/common/redux/customAxios';

// Mock dependencies
jest.mock('@mds/common/redux/customAxios', () => {
    const mock = {
        get: jest.fn(),
        post: jest.fn(),
        delete: jest.fn(),
    };
    return jest.fn(() => mock);
});

const mockAxios = customAxios() as jest.Mocked<any>;

jest.mock('@/components/mine/Permit/Search/components/SearchBox', () => () => <div data-testid="mock-search-box">SearchBox</div>);
jest.mock('@/components/mine/Permit/Search/components/SearchResults', () => () => <div data-testid="mock-search-results">SearchResults</div>);
jest.mock('@/components/mine/Permit/Search/components/MarkdownViewer', () => () => <div data-testid="mock-markdown-viewer">MarkdownViewer</div>);
jest.mock('./NowApplicationDocumentSearchSplashScreen', () => () => <div data-testid="mock-splash-screen">SplashScreen</div>);
jest.mock('lodash', () => {
    const actual = jest.requireActual('lodash');
    return {
        ...actual,
        debounce: (fn: (...args: unknown[]) => unknown) => fn,
    };
});

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
                nowApplicationGuid: "test-guid",
                ...preloadedState,
            },
        },
    });
};

describe('NowApplicationDocumentSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAxios.get.mockResolvedValue({ data: { status: 'never_run' } });
        mockAxios.post.mockResolvedValue({ data: {} });
        mockAxios.delete.mockResolvedValue({ data: {} });
    });

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
        mockAxios.get.mockResolvedValue({ data: { status: 'never_run' } });
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
        mockAxios.get.mockResolvedValue({ data: { status: 'success' } });
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
        mockAxios.get.mockResolvedValue({ data: { status: 'running', percent: 50 } });
        const store = createMockStore({ indexerStatus: { status: 'running', percent: 50 } });
        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        const cancelBtn = await screen.findByText('Cancel');
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

    it('shows active artifact context row when artifact filters are selected', () => {
        const store = createMockStore({
            query: 'table data',
            filters: [
                { category: 'artifact_type', value: 'table' },
                { category: 'artifact_category', value: 'map' },
                { category: 'artifact_page_number', value: '4' },
            ],
        });

        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        expect(screen.getByText('Application Document Search')).toBeInTheDocument();
        expect(screen.getByTestId('mock-search-results')).toBeInTheDocument();
    });

    it('does not show artifact context row when only non-artifact filters are selected', () => {
        const store = createMockStore({
            query: 'technical report',
            filters: [{ category: 'document_type', value: 'Technical Report' }],
        });

        render(
            <Provider store={store}>
                <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
            </Provider>
        );

        expect(screen.queryByText('Showing results for:')).not.toBeInTheDocument();
    });

    describe('last indexed label', () => {
        it('shows the last indexed date and document count once a run has completed', () => {
            const store = createMockStore({
                indexerStatus: {
                    status: 'success',
                    items_processed: 42,
                    document_count: 3,
                    error_count: 0,
                    last_run_start: '2026-08-21T18:00:00.000Z',
                    last_run_end: '2026-08-21T18:08:00.000Z',
                    error_message: null,
                },
            });
            const { container } = render(
                <Provider store={store}>
                    <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
                </Provider>
            );

            expect(container.textContent).toContain('Last indexed:');
            expect(container.textContent).toContain('3 documents');
        });

        it('uses singular "document" when only one document was indexed', () => {
            const store = createMockStore({
                indexerStatus: {
                    status: 'success',
                    items_processed: 1,
                    document_count: 1,
                    error_count: 0,
                    last_run_start: '2026-08-21T18:00:00.000Z',
                    last_run_end: '2026-08-21T18:08:00.000Z',
                    error_message: null,
                },
            });
            const { container } = render(
                <Provider store={store}>
                    <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
                </Provider>
            );

            expect(container.textContent).toContain('1 document');
            expect(container.textContent).not.toContain('1 documents');
        });

        it('does not show a last indexed label while indexing is running', () => {
            const store = createMockStore({
                indexerStatus: {
                    status: 'running',
                    percent: 50,
                    document_count: 3,
                    last_run_start: '2026-08-21T18:00:00.000Z',
                    last_run_end: null,
                },
            });
            const { container } = render(
                <Provider store={store}>
                    <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
                </Provider>
            );

            expect(container.textContent).not.toContain('Last indexed:');
        });

        it('does not show a last indexed label before a run has ever completed', () => {
            const store = createMockStore({
                indexerStatus: { status: 'never_run' },
            });
            const { container } = render(
                <Provider store={store}>
                    <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
                </Provider>
            );

            expect(container.textContent).not.toContain('Last indexed:');
        });
    });

    describe('status polling', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('keeps polling for status while indexing is running', async () => {
            mockAxios.get.mockResolvedValue({ data: { status: 'running', percent: 10 } });
            const store = createMockStore({ indexerStatus: { status: 'running', percent: 10 } });
            render(
                <Provider store={store}>
                    <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
                </Provider>
            );

            const initialCalls = mockAxios.get.mock.calls.length;

            await act(async () => {
                jest.advanceTimersByTime(2_000);
            });

            expect(mockAxios.get.mock.calls.length).toBeGreaterThan(initialCalls);
        });

        it('stops polling once indexing has reached a terminal status', async () => {
            mockAxios.get.mockResolvedValue({ data: { status: 'success', document_count: 3 } });
            const store = createMockStore({
                indexerStatus: { status: 'success', document_count: 3 },
            });
            render(
                <Provider store={store}>
                    <NowApplicationDocumentSearch nowApplicationGuid="test-guid" />
                </Provider>
            );

            const initialCalls = mockAxios.get.mock.calls.length;

            // Advance well past what the old idle-polling interval (10s) would have fired.
            await act(async () => {
                jest.advanceTimersByTime(30_000);
            });

            expect(mockAxios.get.mock.calls.length).toBe(initialCalls);
        });
    });
});
