import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';
import ResultItem from '../components/ResultItem';
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

jest.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: () => <span data-testid="mock-icon" />
}));

jest.mock('@mds/common/redux/actions/modalActions', () => ({
    openModal: jest.fn(() => ({ type: 'OPEN_MODAL' }))
}));

jest.mock('@mds/common/components/documents/DocumentLink', () => ({
    __esModule: true,
    default: ({ documentName }) => <span data-testid="document-link">{documentName}</span>
}));

jest.mock('@mds/common/components/common/ActionMenu', () => ({
    ActionMenuButton: ({ actions, dataTestId }) => (
        <div>
            <button
                data-testid={dataTestId}
                className="ant-btn ant-btn-text ant-dropdown-trigger actions-ellipsis-button"
            />
            <div className="ant-dropdown-menu" role="menu">
                {actions.map(action => (
                    <div
                        key={action.key}
                        role="menuitem"
                        data-testid={`action-${action.key}`}
                        onClick={action.clickFunction}
                    >
                        {action.label}
                    </div>
                ))}
            </div>
        </div>
    )
}));

const mockStore = configureStore([]);

describe('ResultItem', () => {
    const setup = (props = {}) => {
        const store = mockStore({});
        const history = createMemoryHistory();
        const onFilterClick = jest.fn();

        return {
            ...render(
                <Provider store={store}>
                    <Router history={history}>
                        <ResultItem
                            result={MOCK.MOCK_PERMIT_SEARCH_RESULT}
                            onFilterClick={onFilterClick}
                            {...props}
                        />
                    </Router>
                </Provider>
            ),
            store,
            history,
            onFilterClick
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders basic result information', () => {
            const { container } = setup();

            const pathSection = screen.getByTestId('path-section');
            expect(pathSection).toHaveTextContent('Section');

            expect(container).toMatchSnapshot();
        });

        it('displays highlighted content when available', () => {
            setup();
            expect(screen.getByText(/Highlighted.*content/)).toBeInTheDocument();
        });
    });

    describe('Context Expansion', () => {
        it('expands and collapses above contexts', async () => {
            setup();

            expect(screen.queryByTestId('context-item-p1')).not.toBeInTheDocument();
            expect(screen.getByTestId('context-item-p2')).toBeInTheDocument();

            const expandButton = screen.getByTestId('expand-above-contexts');
            expect(expandButton).toHaveTextContent('Show 2');
            fireEvent.click(expandButton);

            await waitFor(() => {
                expect(screen.getByTestId('context-item-p1')).toBeInTheDocument();
                expect(screen.getByTestId('context-item-p2')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Show less'));

            await waitFor(() => {
                expect(screen.queryByTestId('context-item-p1')).not.toBeInTheDocument();
                expect(screen.getByTestId('context-item-p2')).toBeInTheDocument();
            });
        });

        it('expands and collapses below contexts', async () => {
            setup();

            expect(screen.getByTestId('context-item-child1')).toBeInTheDocument();
            expect(screen.queryByTestId('context-item-next1')).not.toBeInTheDocument();

            const expandButton = screen.getByTestId('expand-below-contexts');
            expect(expandButton).toHaveTextContent('Show 1');
            fireEvent.click(expandButton);

            await waitFor(() => {
                expect(screen.getByTestId('context-item-child1')).toBeInTheDocument();
                expect(screen.getByTestId('context-item-next1')).toBeInTheDocument();
            });
        });
    });

    describe('Actions', () => {
        it('navigates to permit page', () => {
            const { history } = setup();
            const actionsButton = screen.getByTestId('condtions-action-button');
            fireEvent.click(actionsButton);

            const goToPermitButton = screen.getByTestId('action-navigate');
            fireEvent.click(goToPermitButton);

            expect(history.location.pathname).toBe('/mine-dashboard/mine-123/permits-and-approvals/permits/permit-123/permit-amendment/amendment-123/conditions');
        });

        it('opens preview modal', () => {
            const { store } = setup();
            const actionsButton = screen.getByTestId('condtions-action-button');
            fireEvent.click(actionsButton);

            const previewButton = screen.getByTestId('action-preview');
            fireEvent.click(previewButton);

            const actions = store.getActions();
            expect(actions).toContainEqual(expect.objectContaining({ type: 'OPEN_MODAL' }));
        });
    });

    describe('Filtering', () => {
        it('handles filter clicks correctly', () => {
            const { onFilterClick } = setup();

            fireEvent.click(screen.getByText('Test Mine'));
            expect(onFilterClick).toHaveBeenCalledWith('mine_name', 'Test Mine');

            fireEvent.click(screen.getByText('M-123'));
            expect(onFilterClick).toHaveBeenCalledWith('permit', 'M-123');

            fireEvent.click(screen.getByText('BC-123'));
            expect(onFilterClick).toHaveBeenCalledWith('mine_number', 'BC-123');
        });
    });

    describe('Highlighting', () => {
        it('highlights result when hash matches', async () => {
            const { container } = setup();

            window.location.hash = '#condition-test-123';
            window.dispatchEvent(new Event('hashchange'));

            await waitFor(() => {
                expect(container.querySelector('.permit-search__result-item--highlighted')).toBeInTheDocument();
            });
        });

        it('removes highlight after timeout', async () => {
            jest.useFakeTimers();
            const { container, unmount } = setup();

            window.location.hash = '#condition-test-123';
            window.dispatchEvent(new Event('hashchange'));

            await waitFor(() => {
                expect(container.querySelector('.permit-search__result-item--highlighted')).toBeInTheDocument();
            });

            act(() => {
                jest.advanceTimersByTime(5000);
            });

            await waitFor(() => {
                expect(container.querySelector('.permit-search__result-item--highlighted')).not.toBeInTheDocument();
            });

            jest.useRealTimers();
            unmount();
        });
    });
});
