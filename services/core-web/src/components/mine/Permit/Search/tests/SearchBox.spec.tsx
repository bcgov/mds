import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import SearchBox from '../components/SearchBox';

describe('SearchBox', () => {
    const setup = (props = {}) => {
        const onSearch = jest.fn();
        return {
            ...render(
                <Form>
                    <SearchBox onSearch={onSearch} {...props} />
                </Form>
            ),
            onSearch
        };
    };

    it('renders with default placeholder', () => {
        setup();
        expect(screen.getByPlaceholderText('Search permit conditions...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
        setup({ placeholder: 'Custom placeholder' });
        expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });

    it('calls onSearch when enter is pressed', () => {
        const { onSearch } = setup();
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test query' } });
        
        // Find the button with the search icon or by class
        const searchButton = document.querySelector('.ant-input-search-button');
        fireEvent.click(searchButton);
        expect(onSearch).toHaveBeenCalledWith('test query');
    });

    it('shows loading state', () => {
        setup({ loading: true });
        // In antd 4, loading state on SearchBox adds an ant-btn-loading class to the button
        const searchButton = document.querySelector('.ant-input-search-button');
        expect(searchButton).toHaveClass('ant-btn-loading');
    });
});
