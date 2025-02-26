import React from 'react';
import { Typography, Checkbox, Space } from 'antd';
import { Facet } from '@mds/common/interfaces/search/facet-search.interface';

const { Title } = Typography;

interface FacetFiltersProps {
    facets: {
        // key: The name of the category (e.g. "mine_name")
        [key: string]: Facet[];
    };
    title: string;
    onFilterChange: (category: string, value: string, checked: boolean) => void;
    pendingFilters: Array<{ category: string; value: string }>; // Filters that have been checked, but not yet applied (e.g. user hasn't clicked "Apply")
}

const FacetFilters: React.FC<FacetFiltersProps> = ({
    facets,
    title,
    onFilterChange,
    pendingFilters,
    ...props
}) => {
    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }} {...props}>
            <Title level={5} style={{ marginBottom: 0 }}>{title}</Title>
            {Object.entries(facets).map(([category, items]) => (
                <Space key={category} direction="vertical" style={{ width: '100%' }} size="small">
                    {items.map(item => (
                        <Checkbox
                            key={item.value}
                            checked={pendingFilters.some(f =>
                                f.category === category && f.value === item.value
                            )}
                            onChange={(e) => onFilterChange(category, item.value, e.target.checked)}
                            data-testid={`filter-checkbox-${category}-${item.value}`}
                        >
                            <Space>
                                {item.value}
                                <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>({item.count})</Typography.Text>
                            </Space>
                        </Checkbox>
                    ))}
                </Space>
            ))}
        </Space>
    );
};

export default FacetFilters;