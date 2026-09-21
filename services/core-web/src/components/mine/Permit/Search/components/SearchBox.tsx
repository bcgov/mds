import React from 'react';
import { Input, Form } from 'antd';

interface Props {
    onSearch: (query: string) => void;
    loading?: boolean;
    size?: 'large' | 'middle';
    placeholder?: string;
}

const SearchBox: React.FC<Props> = ({ onSearch, loading, size = 'middle', placeholder = 'Search permit conditions...' }) => {
    return (
        <Form.Item name="search">
            <Input.Search
                placeholder={placeholder}
                allowClear
                enterButton
                size={size}
                loading={loading}
                onSearch={(value) => value.trim() && onSearch(value.trim())}
                style={size === 'large' ? { fontSize: '16px', height: '50px', width: '400px' } : undefined}
            />
        </Form.Item>
    );
};

export default SearchBox;
