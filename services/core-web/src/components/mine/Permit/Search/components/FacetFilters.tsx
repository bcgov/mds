import React, { useState } from 'react';
import { Typography, Checkbox, Row, Col, Input } from 'antd';
import { Facet } from '@mds/common/interfaces/search/facet-search.interface';
import dayjs from 'dayjs';

const { Title, Link } = Typography;
const { Search } = Input;

const INITIAL_DISPLAY_COUNT = 5;

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
}) => {
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});

    const normalizeFacetValue = (value: unknown) => {
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    const formatFacetValue = (category: string, value: unknown) => {
        const normalizedValue = normalizeFacetValue(value);

        if (!normalizedValue) return '';

        if (category.toLowerCase().includes('date') && dayjs(normalizedValue).isValid()) {
            return dayjs(normalizedValue).format('YYYY-MM-DD');
        }

        return normalizedValue;
    };

    const filterAndSortItems = (category: string, items: Facet[]) => {
        const searchTerm = (searchTerms[category] || '').toLowerCase();
        return items
            .filter(item => {
                const formattedValue = formatFacetValue(category, item?.value);
                return formattedValue.toLowerCase().includes(searchTerm);
            })
            .sort((a, b) => (b.count || 0) - (a.count || 0));
    };

    return (
        <Row gutter={[0, 16]}>
            <Col span={24}>
                <Title level={5} style={{ marginBottom: 0 }}>{title}</Title>
            </Col>
            <Col span={24}>
                {Object.entries(facets).map(([category, items]) => {
                    const filteredItems = filterAndSortItems(category, items);
                    const isExpanded = expanded[category];
                    const totalItems = items.length;
                    const hasMoreItems = totalItems > INITIAL_DISPLAY_COUNT;
                    const displayedItems = isExpanded ? filteredItems : filteredItems.slice(0, INITIAL_DISPLAY_COUNT);

                    return (
                        <Row key={category} gutter={[0, 8]}>
                            {hasMoreItems && (
                                <Col span={24}>
                                    <Search
                                        placeholder="Filter options..."
                                        allowClear
                                        size="small"
                                        value={searchTerms[category] || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSearchTerms(prev => ({
                                                ...prev,
                                                [category]: value
                                            }));
                                        }}
                                        style={{ marginBottom: 8 }}
                                    />
                                </Col>
                            )}

                            {displayedItems.map(item => {
                                const facetValue = normalizeFacetValue(item.value);

                                return (
                                    <Col span={24} key={`${category}-${facetValue}`}>
                                        <Checkbox
                                            checked={pendingFilters.some(f =>
                                                f.category === category && f.value === facetValue
                                            )}
                                            onChange={(e) => onFilterChange(category, facetValue, e.target.checked)}
                                            data-testid={`filter-checkbox-${category}-${facetValue}`}
                                        >
                                            <Row>
                                                <Col flex="auto">{formatFacetValue(category, item.value)}</Col>
                                                <Col>
                                                    <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap', marginLeft: 8 }}>
                                                        ({item.count})
                                                    </Typography.Text>
                                                </Col>
                                            </Row>
                                        </Checkbox>
                                    </Col>
                                );
                            })}

                            {hasMoreItems && !searchTerms[category] && (
                                <Col span={24}>
                                    <Link
                                        onClick={() => setExpanded(prev => ({
                                            ...prev,
                                            [category]: !prev[category]
                                        }))}
                                    >
                                        {isExpanded ? 'Show less' : `Show ${totalItems - INITIAL_DISPLAY_COUNT} more`}
                                    </Link>
                                </Col>
                            )}
                        </Row>
                    );
                })}
            </Col>
        </Row>
    );
};

export default FacetFilters;