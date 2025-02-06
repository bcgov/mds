import React from 'react';
import { Typography, Checkbox, Space } from 'antd';
import { Facet } from '../services/types';

const { Title } = Typography;

interface FacetFiltersProps {
    facets: {
        [key: string]: Facet[];
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
    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={5} style={{ marginBottom: 0 }}>{title}</Title>
            {Object.entries(facets).map(([category, items]) => (
                <Space key={category} direction="vertical" style={{ width: '100%' }} size="small">
                    {items.map(item => (
                        <Checkbox
                            key={item.value}
                            checked={selectedFilters.some(f =>
                                f.category === category && f.value === item.value
                            )}
                            onChange={(e) => onFilterChange(category, item.value, e.target.checked)}
                        >
                            <Space>
                                {item.value}
                                <Typography.Text type="secondary">({item.count})</Typography.Text>
                            </Space>
                        </Checkbox>
                    ))}
                </Space>
            ))}
        </Space>
    );
};

export default FacetFilters;