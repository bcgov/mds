import React from 'react';
import { render, screen } from '@testing-library/react';
import DiffText from '@/components/mine/Permit/DiffText';

describe('DiffText', () => {
    it('renders text with no differences', () => {
        const oldText = 'Hello World';
        const newText = 'Hello World';

        render(<DiffText oldText={oldText} newText={newText} />);

        expect(screen.getByText('Hello World')).toBeInTheDocument();
        expect(screen.queryByText('diff-added')).not.toBeInTheDocument();
        expect(screen.queryByText('diff-removed')).not.toBeInTheDocument();
    });

    it('renders text with additions highlighted', () => {
        const oldText = 'Hello World';
        const newText = 'Hello Beautiful World';

        const { container } = render(<DiffText oldText={oldText} newText={newText} />);

        expect(container.querySelector('.diff-added')).toHaveTextContent('Beautiful');
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('World')).toBeInTheDocument();
    });

    it('renders text with removals highlighted', () => {
        const oldText = 'Hello Beautiful World';
        const newText = 'Hello World';

        const { container } = render(<DiffText oldText={oldText} newText={newText} />);

        expect(container.querySelector('.diff-removed')).toHaveTextContent('Beautiful');
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('World')).toBeInTheDocument();
    });

    it('renders text with both additions and removals', () => {
        const oldText = 'Hello Beautiful World';
        const newText = 'Hello Amazing World';

        const { container } = render(<DiffText oldText={oldText} newText={newText} />);

        expect(container.querySelector('.diff-removed')).toHaveTextContent('Beautiful');
        expect(container.querySelector('.diff-added')).toHaveTextContent('Amazing');
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('World')).toBeInTheDocument();
    });
});