import React, { useState, useEffect } from 'react';
import { List, Typography, Space, Tag, Select, Empty, Collapse, Row, Col, Button, Card, Badge, Skeleton } from 'antd';
import { SearchResult } from '../services/types';
import ResultItem from './ResultItem';
import FacetFilters from './FacetFilters';
import { DownOutlined, FilterOutlined, UpOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockFacets = {
    categories: [
        { name: 'Environmental', count: 45 },
        { name: 'Safety', count: 32 },
        { name: 'Operations', count: 28 }
    ],
    mines: [
        { name: 'Highland Valley Copper', count: 25 },
        { name: 'Mount Polley', count: 18 }
    ],
    years: [
        { name: '2023', count: 35 },
        { name: '2022', count: 42 }
    ]
};

interface SelectedFilter {
    category: string;
    value: string;
}

interface SearchResultsProps {
    results: SearchResult & { allFacets?: { [key: string]: any[] } };
    loading?: boolean;
    setFilters: (filters: Array<{ category: string; value: string }>) => void;
    selectedFilters: SelectedFilter[];
}

const SearchResults: React.FC<SearchResultsProps> = ({
    results,
    loading,
    setFilters,
    selectedFilters
}) => {
    const [localFilters, setLocalFilters] = useState<SelectedFilter[]>(selectedFilters || []);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [hasFilterChanges, setHasFilterChanges] = useState(false);
    const totalResults = results?.documents?.length || 0;

    // Update local filters when prop changes
    useEffect(() => {
        setLocalFilters(selectedFilters || []);
    }, [selectedFilters]);

    const handleFilterChange = (category: string, value: string, checked: boolean) => {
        if (checked) {
            setLocalFilters(prev => [...prev, { category, value }]);
        } else {
            setLocalFilters(prev =>
                prev.filter(f => !(f.category === category && f.value === value))
            );
        }
        setHasFilterChanges(true);
    };

    const removeFilter = (category: string, value: string) => {
        const updatedFilters = localFilters.filter(
            f => !(f.category === category && f.value === value)
        );
        setLocalFilters(updatedFilters);
        setFilters(updatedFilters); // Apply immediately when removing
    };

    const applyFilters = () => {
        setFilters(localFilters);
        setHasFilterChanges(false);
    };

    if (!results && !loading) {
        return (
            <div style={{
                width: '100%',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Enter a search term to find permit conditions"
                />
            </div>
        );
    }

    const handleTagFilter = (category: string, value: string) => {
        if (!localFilters.some(f => f.category === category && f.value === value)) {
            setLocalFilters(prev => [...prev, { category, value }]);
            setHasFilterChanges(true); // Add this line to enable the Apply button
        }
    };

    const renderFacets = () => {
        if (!results?.allFacets) return null;

        return Object.entries(results.allFacets).map(([facetKey, facets]) => {
            // Get current facet counts
            const currentFacets = results.facets?.[facetKey] || [];

            // Update counts while preserving all options
            const updatedFacets = facets.map(facet => ({
                ...facet,
                count: currentFacets.find(cf => cf.value === facet.value)?.count || 0
            }));

            return (
                <Col span={8} key={facetKey}>
                    <FacetFilters
                        title={facetKey.replace(/_/g, ' ')}
                        facets={{ [facetKey]: updatedFacets }}
                        selectedFilters={localFilters}
                        onFilterChange={handleFilterChange}
                    />
                </Col>
            );
        });
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

            {totalResults > 0 && (
                <Text style={{ color: '#00000073' }}>
                    Found {totalResults} permit condition{totalResults === 1 ? '' : 's'}
                </Text>
            )}

            <div style={{
                background: '#fafafa',
                borderRadius: '8px',
                marginBottom: 24,
                width: '100%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
                {/* Filter Header */}
                <div style={{
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                }} onClick={() => setFiltersVisible(!filtersVisible)}>
                    <Space>
                        <FilterOutlined />
                        <span>Filters</span>
                        {localFilters?.length > 0 && (
                            <Badge count={localFilters?.length} style={{ backgroundColor: '#1890ff' }} />
                        )}
                    </Space>
                    {filtersVisible ? <UpOutlined /> : <DownOutlined />}
                </div>

                {/* Filter Content */}
                <div style={{
                    maxHeight: filtersVisible ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative'
                }}>
                    <div style={{
                        padding: '0 16px 16px',
                        ...(filtersVisible ? {} : {
                            maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                        })
                    }}>
                        <Row gutter={[24, 16]}>
                            {renderFacets()}
                        </Row>
                        {(localFilters.length > 0 || hasFilterChanges) && (
                            <Row justify="end" style={{ marginTop: 16 }}>
                                <Space>
                                    <Button onClick={() => {
                                        setLocalFilters([]);
                                        setFilters([]);
                                        setHasFilterChanges(false);
                                    }}>
                                        Clear All
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={applyFilters}
                                        disabled={!hasFilterChanges}
                                    >
                                        Apply Filters
                                    </Button>
                                </Space>
                            </Row>
                        )}
                    </div>
                </div>
            </div>

            {localFilters.length > 0 && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid #e8e8e8' }}>
                    <Space wrap>
                        {localFilters.map(({ category, value }) => (
                            <Tag
                                key={`${category}-${value}`}
                                closable
                                onClose={() => removeFilter(category, value)}
                            >
                                {`${category}: ${value}`}
                            </Tag>
                        ))}
                        {localFilters.length > 0 && (
                            <Typography.Link onClick={() => setLocalFilters([])}>
                                Clear all
                            </Typography.Link>
                        )}
                    </Space>
                </div>
            )}

            {/* Results list */}
            {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
                <List
                    itemLayout="vertical"
                    dataSource={results?.documents || []}
                    locale={{ emptyText: 'No results found' }}
                    style={{
                        background: '#fff',
                        borderRadius: '8px',
                        padding: '0 24px'
                    }}
                    renderItem={(result) => (
                        <ResultItem
                            result={result}
                            onFilterClick={handleTagFilter}
                        />
                    )}
                />
            )}
        </Space >
    );
};

export default SearchResults;