import React, { useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Space } from 'antd';
import SearchBox from './components/SearchBox';
import SearchResults, { SelectedFilter } from './components/SearchResults';
import MarkdownViewer from './components/MarkdownViewer';
import { useAppDispatch, useAppSelector } from '@mds/common/redux/rootState';
import { selectSearchResults, selectSearchLoading, selectSearchQuery, selectSearchFilters, searchPermitConditions, } from '@mds/common/redux/slices/permitSearchSlice';
import PermitConditionSearchSplashScreen from './components/PermitConditionSearchSplashScreen';
import FormWrapper from '@mds/common/components/forms/FormWrapper';
import { FORM } from '@mds/common/constants/forms';
import { debounce } from 'lodash';
import { change } from '@mds/common/components/forms/form';



const PermitConditionSearch: React.FC = () => {
    const dispatch = useAppDispatch();
    const results = useAppSelector(selectSearchResults);
    const loading = useAppSelector(selectSearchLoading);
    const query = useAppSelector(selectSearchQuery);
    const selectedFilters = useAppSelector(selectSearchFilters);

    const hasActiveSearch = query || selectedFilters?.length > 0;
    const isLoading = loading;
    const shouldShowSplash = !hasActiveSearch && !isLoading;

    const performSearch = (query: string, filters: SelectedFilter[]) => {
        dispatch(searchPermitConditions({ query, filters }));
    };

    const debouncedSearch = debounce(performSearch, 300);

    useEffect(() => {
        dispatch(change(FORM.PERMIT_CONDITION_SEARCH, 'search', query));
    }, [query]);

    return (
        <Layout className="permit-search__layout">
            <Layout.Content className="permit-search__content">
                {shouldShowSplash ? (
                    <PermitConditionSearchSplashScreen
                        onSearch={query => debouncedSearch(query, selectedFilters)}
                        loading={loading}
                    />
                ) : (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Typography.Title level={1} style={{ marginBottom: 0 }}>Permit Condition Search</Typography.Title>
                        <SearchBox onSearch={query => debouncedSearch(query, selectedFilters)} loading={loading} />
                        <Row gutter={32}>
                            <Col span={16}>
                                <SearchResults onFilterChange={filters => debouncedSearch(query, filters)} />
                            </Col>
                            <Col span={8}>
                                <Card title="AI-Generated Response" loading={loading}>
                                    {results?.prompt?.answers?.map((result) => (
                                        <MarkdownViewer key={`prompt-${result.substring(0, 20)}`} markdown={result} />
                                    ))}
                                </Card>
                            </Col>
                        </Row>
                    </Space>
                )}
            </Layout.Content>
        </Layout>
    );
};

const PermitConditionSearchForm: React.FC = () => {
    return <FormWrapper name={FORM.PERMIT_CONDITION_SEARCH} onSubmit={() => { }}>
        <PermitConditionSearch />
    </FormWrapper>;
}

export default PermitConditionSearchForm;
