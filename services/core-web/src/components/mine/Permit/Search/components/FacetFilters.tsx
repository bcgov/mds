import React from 'react';
import { Typography, Checkbox, Space } from 'antd';

const { Title } = Typography;

interface FacetFiltersProps {
    facets: {
        [key: string]: Array<{ name: string; count: number }>;
    };
    title: string;
    selectedFilters: Array<{ category: string; value: string }>;
    onFilterChange: (category: string, value: string, checked: boolean) => void;
}

const FacetFilters: React.FC<FacetFiltersProps> = ({
    facets,
    title,
    selectedFilters,
    onFilterChange
}) => {
    const items = Object.values(facets)[0];

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={5} style={{ marginBottom: 0 }}>{title}</Title>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
                {items.map(item => (
                    <Checkbox
                        key={item.name}
                        checked={selectedFilters.some(f =>
                            f.category === title && f.value === item.name
                        )}
                        onChange={(e) => onFilterChange(title, item.name, e.target.checked)}
                    >
                        <Space>
                            {item.name}
                            <Typography.Text type="secondary">({item.count})</Typography.Text>
                        </Space>
                    </Checkbox>
                ))}
            </Space>
        </Space>
    );
};

export default FacetFilters;