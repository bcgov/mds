import React from 'react';
import { Input, Space, Form } from 'antd';

interface Props {
    onSearch: (query: string) => void;
    loading?: boolean;
    size?: 'large' | 'middle';
}

const SearchBox: React.FC<Props> = ({ onSearch, loading, size = 'middle' }) => {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name="search">
                <Input.Search
                    placeholder="Search permit conditions..."
                    allowClear
                    enterButton
                    size={size}
                    loading={loading}
                    onSearch={(value) => value.trim() && onSearch(value.trim())}
                    style={size === 'large' ? { fontSize: '16px', height: '50px', width: '400px' } : undefined}
                />
            </Form.Item>
        </Space>
    );
};

export default SearchBox;
