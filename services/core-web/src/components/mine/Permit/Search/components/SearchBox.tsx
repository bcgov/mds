import React from 'react';
import { Input, Space } from 'antd';

interface Props {
    onSearch: (query: string) => void;
    loading?: boolean;
    size?: 'large' | 'middle';
    query: string;
}

const SearchBox: React.FC<Props> = ({ onSearch, loading, size = 'middle', query }) => {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Input.Search
                placeholder="Search permit conditions..."
                allowClear
                enterButton
                size={size}
                loading={loading}
                value={query}
                onSearch={(value) => value.trim() && onSearch(value.trim())}
                style={size === 'large' ? { fontSize: '16px', height: '50px', width: '400px' } : undefined}
            />
        </Space>
    );
};

export default SearchBox;
