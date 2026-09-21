import React from 'react';
import { Drawer, Button, Space, Row, Col, Badge } from 'antd';
import { SelectedFilter } from './SearchResults';
import { useAppSelector, RootState } from '@mds/common/redux/rootState';
import { selectAllFacets } from '@mds/common/redux/slices/permitSearchSlice';
import FacetFilters from './FacetFilters';
import { FilterOutlined } from '@ant-design/icons';
import { Facet, SearchResult } from '@mds/common/interfaces/search/facet-search.interface';

interface FilterDrawerProps {
    visible: boolean;
    onClose: () => void;
    results?: SearchResult | null;
    pendingFilters: SelectedFilter[];
    selectedFilters: SelectedFilter[];
    onFilterChange: (category: string, value: string, checked: boolean) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    hasFilterChanges: boolean;
    /** Override the facets selector when using outside the permit search context. */
    selectAllFacetsOverride?: (state: RootState) => { [key: string]: Facet[] };
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
    visible,
    onClose,
    results,
    pendingFilters,
    selectedFilters,
    onFilterChange,
    onApplyFilters,
    onClearFilters,
    hasFilterChanges,
    selectAllFacetsOverride,
}) => {
    const allFacets = useAppSelector(selectAllFacetsOverride ?? selectAllFacets);

    const findFacetCount = (facetValue: string, currentFacets: any[]) => {
        const found = currentFacets.find(cf => cf.value === facetValue);
        return found?.count || 0;
    };

    const renderFacets = () => {
        if (!allFacets) return null;

        return Object.entries(allFacets).map(([facetKey, facets]) => {
            const currentFacets = results?.facets?.[facetKey] || [];
            const updatedFacets = facets?.map(facet => ({
                ...facet,
                count: findFacetCount(facet.value, currentFacets)
            }));

            return (
                <Col span={24} key={facetKey}>
                    <FacetFilters
                        title={facetKey.replace(/_/g, ' ')}
                        facets={{ [facetKey]: updatedFacets }}
                        onFilterChange={onFilterChange}
                        pendingFilters={pendingFilters}
                        data-testid={`facet-group-${facetKey}`}
                    />
                </Col>
            );
        });
    };

    return (
        <Drawer
            title={
                <Space>
                    <FilterOutlined />
                    <span>Filters</span>
                    {selectedFilters?.length > 0 && (
                        <Badge count={selectedFilters?.length} style={{ backgroundColor: '#1890ff' }} />
                    )}
                </Space>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width={400}
            footer={
                <Row justify="end" gutter={[8, 8]}>
                    <Col>
                        <Space>
                            <Button onClick={onClearFilters}>Clear All</Button>
                            <Button
                                type="primary"
                                onClick={onApplyFilters}
                                disabled={!hasFilterChanges}
                            >
                                Apply Filters
                            </Button>
                        </Space>
                    </Col>
                </Row>
            }
        >
            <Row gutter={[0, 16]}>
                {renderFacets()}
            </Row>
        </Drawer>
    );
};

export default FilterDrawer;
