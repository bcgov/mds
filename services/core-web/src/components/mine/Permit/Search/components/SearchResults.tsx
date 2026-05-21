import React, { useState, useEffect } from 'react';
import { List, Space, Tag, Empty, Row, Col, Button, Badge, Skeleton, Typography, Divider } from 'antd';
import ResultItem from './ResultItem';
import { FilterOutlined } from '@ant-design/icons';
import { useAppSelector, RootState } from '@mds/common/redux/rootState';
import {
    selectSearchResults,
    selectSearchFilters,
    selectSearchQuery,
    selectDocumentLoading,
} from '@mds/common/redux/slices/permitSearchSlice';
import { Facet, HaystackDocumentSearchResult, SearchResult } from '@mds/common/interfaces/search/facet-search.interface';
import FilterDrawer from './FilterDrawer';
import { startCase } from 'lodash';
import dayjs from 'dayjs';

export interface SelectedFilter {
    category: string;
    value: string;
}

export interface SearchResultsProps {
    onFilterChange: (selectedFilters: SelectedFilter[]) => void;
    /**
     * Optional custom renderer for each result row. When omitted the default
     * permit-condition ResultItem is used. Pass this when embedding SearchResults
     * in a different search context (e.g. NoW document search).
     */
    renderItem?: (result: HaystackDocumentSearchResult, onFilterClick: (category: string, value: string) => void, index?: number) => React.ReactNode;
    /**
     * Optional selector overrides — pass these when using SearchResults outside of the
     * permit condition search context (e.g. NoW application document search).
     * Defaults to the permit search slice selectors so existing usage is unchanged.
     */
    selectors?: {
        selectResults?: (state: RootState) => SearchResult | null;
        selectFilters?: (state: RootState) => SelectedFilter[];
        selectQuery?: (state: RootState) => string;
        selectDocumentLoading?: (state: RootState) => boolean;
        selectAllFacets?: (state: RootState) => { [key: string]: Facet[] };
    };
}

/**
 * Component to display search results and filter options.
 *
 * Maintains a local state for pending filters, which are filters that have been checked but not yet applied.
 * - When a filter is checked, it is added to the pending filters.
 * - When a filter is unchecked, it is removed from the pending filters.
 * - When the user clicks "Apply Filters", the pending filters are applied to the search results.
 */
const SearchResults: React.FC<SearchResultsProps> = ({ onFilterChange, renderItem, selectors }) => {
    const results = useAppSelector(selectors?.selectResults ?? selectSearchResults);
    const documentLoading = useAppSelector(selectors?.selectDocumentLoading ?? selectDocumentLoading);
    const selectedFilters = useAppSelector(selectors?.selectFilters ?? selectSearchFilters);
    const query = useAppSelector(selectors?.selectQuery ?? selectSearchQuery);

    const [pendingFilters, setPendingFilters] = useState<SelectedFilter[]>(selectedFilters);
    const [hasFilterChanges, setHasFilterChanges] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

    useEffect(() => {
        setPendingFilters(selectedFilters);
    }, [selectedFilters]);

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
        setHasFilterChanges(false);
    };

    const applyFilters = () => {
        onFilterChange(pendingFilters);
        setHasFilterChanges(false);
    };

    const clearAllFilters = () => {
        setPendingFilters([]); // Clear pending filters (checkboxes)
        setHasFilterChanges(true); // Show apply button
        // Don't dispatch to Redux yet - wait for user to click Apply
    };

    const handleTagFilter = (category: string, value: string) => {
        const filterExists = pendingFilters.some(f =>
            f.category === category && f.value === value);

        if (!filterExists) {
            const newFilters = [...pendingFilters, { category, value }];

            setPendingFilters(newFilters);
            setHasFilterChanges(false);

            onFilterChange(newFilters);
        }
    };

    const formatFilterValue = (category: string, value: string) => {
        if (category.toLowerCase().includes('date') && dayjs(value).isValid()) {
            return dayjs(value).format('YYYY-MM-DD');
        }
        return value;
    };


    if (!query && !results && !documentLoading) {
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
                {documentLoading ? (
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
                        renderItem={(result, index) =>
                            renderItem
                                ? renderItem(result, handleTagFilter, index)
                                : <ResultItem result={result} onFilterClick={handleTagFilter} />
                        }
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
                selectAllFacetsOverride={selectors?.selectAllFacets}
            />
        </Row >
    );
};

export default SearchResults;