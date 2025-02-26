import React, { useState, useEffect } from 'react';
import { List, Space, Tag, Empty, Row, Col, Button, Badge, Skeleton, Typography, Divider } from 'antd';
import ResultItem from './ResultItem';
import { FilterOutlined } from '@ant-design/icons';
import { useAppSelector } from '@mds/common/redux/rootState';
import { selectSearchResults, selectSearchLoading, selectSearchFilters, selectSearchQuery, selectSearchStreaming, selectAiLoading, selectDocumentLoading } from '@mds/common/redux/slices/permitSearchSlice';
import { HaystackDocumentSearchResult } from '@mds/common/interfaces/search/facet-search.interface';
import FilterDrawer from './FilterDrawer';
import { startCase } from 'lodash';
import dayjs from 'dayjs';

export interface SelectedFilter {
    category: string;
    value: string;
}

export interface SearchResultsProps {
    onFilterChange: (selectedFilters: SelectedFilter[]) => void;
}

/**
 * Component to display search results and filter options.
 * 
 * Maintains a local state for pending filters, which are filters that have been checked but not yet applied.
 * - When a filter is checked, it is added to the pending filters.
 * - When a filter is unchecked, it is removed from the pending filters.
 * - When the user clicks "Apply Filters", the pending filters are applied to the search results.
 */
const SearchResults: React.FC<SearchResultsProps> = ({ onFilterChange }) => {
    const results = useAppSelector(selectSearchResults);
    const loading = useAppSelector(selectSearchLoading);
    const streaming = useAppSelector(selectSearchStreaming);
    const aiLoading = useAppSelector(selectAiLoading);
    const documentLoading = useAppSelector(selectDocumentLoading);
    const selectedFilters = useAppSelector(selectSearchFilters);
    const query = useAppSelector(selectSearchQuery);

    const [pendingFilters, setPendingFilters] = useState<SelectedFilter[]>(selectedFilters);
    const [hasFilterChanges, setHasFilterChanges] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

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
        onFilterChange(updatedFilters) // Apply immediately when removing
        onFilterChange(updatedFilters) // Apply immediately when removing
        setHasFilterChanges(false);
    };

    const applyFilters = () => {
        onFilterChange(pendingFilters);
        onFilterChange(pendingFilters);
        setHasFilterChanges(false);
    };

    const clearAllFilters = () => {
        setPendingFilters([]); // Clear pending filters (checkboxes)
        setHasFilterChanges(true); // Show apply button
        // Don't dispatch to Redux yet - wait for user to click Apply
    };

    const handleTagFilter = (category: string, value: string) => {
        if (!pendingFilters.some(f => f.category === category && f.value === value)) {
            setPendingFilters(prev => [...prev, { category, value }]);
            setHasFilterChanges(true); // Add this line to enable the Apply button
        }
    };

    const formatFilterValue = (category: string, value: string) => {
        if (category.toLowerCase().includes('date') && dayjs(value).isValid()) {
            return dayjs(value).format('YYYY-MM-DD');
        }
        return value;
    };

    // Separate loading indicators for documents and AI
    const isDocumentsLoading = documentLoading;
    const isAiLoading = aiLoading;

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

    return (
        <Row gutter={[0, 24]}>
            <Col span={24}>
                <Row justify="space-between" align="middle" className="permit-search__filter-section">
                    <Col>
                        {results?.documents && (
                            <Typography.Text type="secondary">
                                <Typography.Text type="secondary" strong>{results.documents.length}</Typography.Text>
                                {' results'}{query ? ` for "` : ''}<Typography.Text italic type="secondary">{query}</Typography.Text>{query ? `"` : ''}
                            </Typography.Text>
                        )}
                    </Col>
                    <Col>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setDrawerVisible(true)}
                        >
                            Filters
                            {selectedFilters?.length > 0 && (
                                <Badge
                                    count={selectedFilters?.length}
                                    style={{
                                        backgroundColor: '#1890ff',
                                        marginLeft: '8px',
                                        marginRight: '-8px'
                                    }}
                                />
                            )}
                        </Button>
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        {selectedFilters.length > 0 && (
                            <Col span={24} className="permit-search__selected-filters">
                                <Space wrap>
                                    {selectedFilters.map(({ category, value }) => (
                                        <Tag
                                            key={`${category}-${value}`}
                                            closable
                                            onClose={() => removeFilter(category, value)}
                                            data-testid={`selected-filter-${category}-${value}`}
                                        >
                                            {`${startCase(category)}: ${formatFilterValue(category, value)}`}
                                        </Tag>
                                    ))}
                                </Space>
                            </Col>)
                        }
                    </Col>
                </Row>
                <Divider style={{ margin: '12px 0 0' }} />
            </Col>
            <Col span={24}>
                {/* Document results section */}
                {isDocumentsLoading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                    <List<HaystackDocumentSearchResult>
                        itemLayout="vertical"
                        dataSource={results?.documents || []}
                        locale={{ emptyText: 'No results found' }}
                        style={{
                            background: '#fff',
                            borderRadius: '8px',
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
            </Col>

            <FilterDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                results={results}
                pendingFilters={pendingFilters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onApplyFilters={() => {
                    applyFilters();
                    setDrawerVisible(false);
                }}
                onClearFilters={clearAllFilters}
                hasFilterChanges={hasFilterChanges}
            />
        </Row >
    );
};

export default SearchResults;