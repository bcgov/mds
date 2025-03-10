import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionMenu, { ActionMenuButton, deleteConfirmWrapper, generateActionMenuItems } from './ActionMenu';
import { Modal } from 'antd';

jest.mock('antd', () => {
    const originalModule = jest.requireActual('antd');
    return {
        ...originalModule,
        Modal: {
            ...originalModule.Modal,
            confirm: jest.fn(),
        },
    };
});

describe('ActionMenu', () => {
    const mockActionItems = [
        {
            key: 'edit',
            label: 'Edit',
            clickFunction: jest.fn(),
        },
        {
            key: 'delete',
            label: 'Delete',
            clickFunction: jest.fn(),
            disabled: true,
        },
    ];

    const mockRecord = { id: '123', name: 'Test Record' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ActionMenu component', () => {
        it('renders with action items', () => {
            render(
                <ActionMenu
                    record={mockRecord}
                    actionItems={mockActionItems}
                    category="Test"
                />
            );

            expect(screen.getByText('Actions')).toBeInTheDocument();
        });
    });

    describe('ActionMenuButton', () => {
        it('renders with default props', () => {
            render(
                <ActionMenuButton
                    actions={[
                        { key: 'test', label: 'Test Action', clickFunction: jest.fn() }
                    ]}
                />
            );

            expect(screen.getByText('Action')).toBeInTheDocument();
        });

        it('renders with custom button text', () => {
            render(
                <ActionMenuButton
                    buttonText="Custom Action"
                    actions={[
                        { key: 'test', label: 'Test Action', clickFunction: jest.fn() }
                    ]}
                />
            );

            expect(screen.getByText('Custom Action')).toBeInTheDocument();
        });

        it('renders as ellipsis when useEllipsis is true', () => {
            render(
                <ActionMenuButton
                    useEllipsis={true}
                    actions={[
                        { key: 'test', label: 'Test Action', clickFunction: jest.fn() }
                    ]}
                />
            );

            expect(screen.queryByText('Action')).not.toBeInTheDocument();
        });

        it('applies disabled state', () => {
            render(
                <ActionMenuButton
                    disabled={true}
                    actions={[
                        { key: 'test', label: 'Test Action', clickFunction: jest.fn() }
                    ]}
                />
            );

            expect(screen.getByText('Action').closest('button')).toBeDisabled();
        });
    });

    describe('generateActionMenuItems', () => {
        it('creates menu items from action items', () => {
            const result = generateActionMenuItems(mockActionItems, mockRecord);

            expect(result).toHaveLength(2);
            expect(result[0].key).toBe('edit');
            expect(result[1].key).toBe('delete');
        });

        it('creates clickable menu items that call provided function', () => {
            const result = generateActionMenuItems(mockActionItems, mockRecord);

            // Simulate clicking on the button in the first menu item
            const buttonElement = render(result[0].label as React.ReactElement).getByTestId('action-button-edit');
            fireEvent.click(buttonElement);

            expect(mockActionItems[0].clickFunction).toHaveBeenCalledWith(expect.anything(), mockRecord);
        });
    });

    describe('deleteConfirmWrapper', () => {
        it('calls Modal.confirm with correct parameters', () => {
            const onOkMock = jest.fn();
            deleteConfirmWrapper('test item', onOkMock);

            expect(Modal.confirm).toHaveBeenCalledWith({
                title: 'Confirm Deletion',
                content: 'Are you sure you want to delete this test item?',
                onOk: onOkMock,
                okText: 'Delete',
            });
        });

        it('handles plural case correctly', () => {
            const onOkMock = jest.fn();
            deleteConfirmWrapper('test items', onOkMock, true);

            expect(Modal.confirm).toHaveBeenCalledWith(expect.objectContaining({
                content: 'Are you sure you want to delete these test items?',
            }));
        });
    });
});
