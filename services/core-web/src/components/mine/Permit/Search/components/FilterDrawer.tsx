import React from 'react';
import { Drawer, Space, Button, Row, Col, Badge } from 'antd';
import FacetFilters from './FacetFilters';
import { FilterOutlined } from '@ant-design/icons';
import { SelectedFilter } from './SearchResults';
import { HaystackSearchResponse } from '@mds/common/interfaces/search/facet-search.interface';

interface FilterDrawerProps {
    visible: boolean;
    onClose: () => void;
    results?: HaystackSearchResponse;
    pendingFilters: SelectedFilter[];
    selectedFilters: SelectedFilter[];
    onFilterChange: (category: string, value: string, checked: boolean) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    hasFilterChanges: boolean;
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
    hasFilterChanges
}) => {
    const renderFacets = () => {
        if (!results?.allFacets) return null;

        return Object.entries(results.allFacets).map(([facetKey, facets]) => {
            const currentFacets = results.facets?.[facetKey] || [];
            const updatedFacets = facets.map(facet => ({
                ...facet,
                count: currentFacets.find(cf => cf.value === facet.value)?.count || 0
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
