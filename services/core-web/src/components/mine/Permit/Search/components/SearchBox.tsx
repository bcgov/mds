import React from 'react';
import { Input, Space } from 'antd';
import { SearchProps } from 'antd/es/input';

interface Props {
    onSearch: (query: string) => void;
    loading?: boolean;
}

const SearchBox: React.FC<Props> = ({ onSearch, loading }) => {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Input.Search
                placeholder="Search permit conditions..."
                allowClear
                enterButton
                size="large"
                loading={loading}
                onSearch={(value) => value.trim() && onSearch(value.trim())}
            />
        </Space>
    );
};

export default SearchBox;
