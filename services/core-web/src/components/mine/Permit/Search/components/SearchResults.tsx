import React, { useState } from 'react';
import { List, Typography, Space, Tag, Select, Empty, Collapse, Row, Col, Button, Card, Badge, Skeleton } from 'antd';
import { SearchResultsProps } from '../services/types';
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

const SearchResults: React.FC<SearchResultsProps & { loading?: boolean }> = ({
    results,
    loading
}) => {
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilter[]>([]);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const totalResults = results?.documents?.length || 0;

    const handleFilterChange = (category: string, value: string, checked: boolean) => {
        if (checked) {
            setSelectedFilters(prev => [...prev, { category, value }]);
        } else {
            setSelectedFilters(prev =>
                prev.filter(f => !(f.category === category && f.value === value))
            );
        }
    };

    const removeFilter = (category: string, value: string) => {
        setSelectedFilters(prev =>
            prev.filter(f => !(f.category === category && f.value === value))
        );
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
        if (!selectedFilters.some(f => f.category === category && f.value === value)) {
            setSelectedFilters(prev => [...prev, { category, value }]);
        }
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
                        {selectedFilters?.length > 0 && (
                            <Badge count={selectedFilters?.length} style={{ backgroundColor: '#1890ff' }} />
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
                            <Col span={8}>
                                <FacetFilters
                                    facets={{ categories: mockFacets.categories }}
                                    title="Categories"
                                    selectedFilters={selectedFilters}
                                    onFilterChange={handleFilterChange}
                                />
                            </Col>
                            <Col span={8}>
                                <FacetFilters
                                    facets={{ mines: mockFacets.mines }}
                                    title="Mines"
                                    selectedFilters={selectedFilters}
                                    onFilterChange={handleFilterChange}

                                />
                            </Col>
                            <Col span={8}>
                                <FacetFilters
                                    facets={{ years: mockFacets.years }}
                                    title="Years"
                                    selectedFilters={selectedFilters}
                                    onFilterChange={handleFilterChange}
                                />
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>

            {selectedFilters.length > 0 && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid #e8e8e8' }}>
                    <Space wrap>
                        {selectedFilters.map(({ category, value }) => (
                            <Tag
                                key={`${category}-${value}`}
                                closable
                                onClose={() => removeFilter(category, value)}
                            >
                                {`${category}: ${value}`}
                            </Tag>
                        ))}
                        {selectedFilters.length > 0 && (
                            <Typography.Link onClick={() => setSelectedFilters([])}>
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