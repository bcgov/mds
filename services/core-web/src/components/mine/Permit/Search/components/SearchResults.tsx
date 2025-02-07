import React, { useState, useEffect } from 'react';
import { List, Space, Tag, Empty, Row, Col, Button, Badge, Skeleton } from 'antd';
import ResultItem from './ResultItem';
import FacetFilters from './FacetFilters';
import { DownOutlined, FilterOutlined, UpOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@mds/common/redux/rootState';
import { selectSearchResults, selectSearchLoading, selectSearchFilters, setFilters } from '@mds/common/redux/slices/permitSearchSlice';
import { HaystackDocumentSearchResult } from '@mds/common/interfaces/search/facet-search.interface';

interface SelectedFilter {
    category: string;
    value: string;
}

const SearchResults: React.FC = () => {
    const dispatch = useAppDispatch();
    const results = useAppSelector(selectSearchResults);
    const loading = useAppSelector(selectSearchLoading);
    const selectedFilters = useAppSelector(selectSearchFilters);

    const [pendingFilters, setPendingFilters] = useState<SelectedFilter[]>(selectedFilters);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [hasFilterChanges, setHasFilterChanges] = useState(false);

    useEffect(() => {
        setPendingFilters(selectedFilters);
    }, [selectedFilters]);

    const handleFilterChange = (category: string, value: string, checked: boolean) => {
        let newFilters: SelectedFilter[];
        if (checked) {
            newFilters = [...pendingFilters, { category, value }];
        } else {
            newFilters = pendingFilters.filter(f => !(f.category === category && f.value === value));
        }
        setPendingFilters(newFilters);
        setHasFilterChanges(true);
    };

    const removeFilter = (category: string, value: string) => {
        const updatedFilters = pendingFilters.filter(
            f => !(f.category === category && f.value === value)
        );
        setPendingFilters(updatedFilters);
        dispatch(setFilters(updatedFilters)); // Apply immediately when removing
        setHasFilterChanges(false);
    };

    const applyFilters = () => {
        dispatch(setFilters(pendingFilters));
        setHasFilterChanges(false);
    };

    const clearAllFilters = () => {
        setPendingFilters([]); // Clear pending filters (checkboxes)
        setHasFilterChanges(true); // Show apply button
        // Don't dispatch to Redux yet - wait for user to click Apply
    };

    if (!results && !loading) {
        return (
            <Row className="permit-search__empty-state" justify="center" align="middle">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Enter a search term to find permit conditions"
                />
            </Row>
        );
    }

    const handleTagFilter = (category: string, value: string) => {
        if (!pendingFilters.some(f => f.category === category && f.value === value)) {
            setPendingFilters(prev => [...prev, { category, value }]);
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
                        onFilterChange={handleFilterChange}
                        pendingFilters={pendingFilters}  // Add this prop
                    />
                </Col>
            );
        });
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

            <div className="permit-search__filter-section">
                <Row justify="space-between" align="middle" className="permit-search__filter-header" onClick={() => setFiltersVisible(!filtersVisible)}>
                    <Space>
                        <FilterOutlined />
                        <span>Filters</span>
                        {selectedFilters?.length > 0 && (
                            <Badge count={selectedFilters?.length} style={{ backgroundColor: '#1890ff' }} />
                        )}
                    </Space>
                    {filtersVisible ? <UpOutlined /> : <DownOutlined />}
                </Row>

                <div className={`permit-search__filter-content ${filtersVisible ? 'permit-search__filter-content--visible' : 'permit-search__filter-content--hidden'}`}>
                    <div className={`permit-search__filter-inner ${!filtersVisible && 'permit-search__filter-inner--hidden'}`}>
                        <Row gutter={[24, 16]}>
                            {renderFacets()}
                        </Row>
                        {(pendingFilters.length > 0 || hasFilterChanges) && (
                            <Row justify="end" style={{ marginTop: 16 }}>
                                <Space>
                                    <Button onClick={clearAllFilters}>
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

            {selectedFilters.length > 0 && (
                <div className="permit-search__selected-filters">
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
                    </Space>
                </div>
            )}

            {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
                <List<HaystackDocumentSearchResult>
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
                    className="permit-search__results-list"
                />
            )}
        </Space >
    );
};

export default SearchResults;