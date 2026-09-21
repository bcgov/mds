import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FacetFilters from '@/components/mine/Permit/Search/components/FacetFilters';

describe('FacetFilters', () => {
    it('normalizes non-string facet values for filtering and callbacks', () => {
        const onFilterChange = jest.fn();

        render(
            <FacetFilters
                title="Test Filters"
                facets={{
                    permit_number: [
                        { value: 1001 as unknown as string, count: 3 },
                        { value: 1002 as unknown as string, count: 1 },
                        { value: 1003 as unknown as string, count: 1 },
                        { value: 1004 as unknown as string, count: 1 },
                        { value: 1005 as unknown as string, count: 1 },
                        { value: 1006 as unknown as string, count: 1 },
                    ],
                }}
                onFilterChange={onFilterChange}
                pendingFilters={[]}
            />
        );

        fireEvent.change(screen.getByPlaceholderText('Filter options...'), {
            target: { value: '1002' },
        });

        expect(screen.getByText('1002')).toBeInTheDocument();
        expect(screen.queryByText('1001')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('checkbox'));

        expect(onFilterChange).toHaveBeenCalledWith('permit_number', '1002', true);
    });
});