import React, { useEffect, useState } from 'react';
import { Layout, Typography, Row, Col, Card, Skeleton } from 'antd';
import SearchBox from './components/SearchBox';
import SearchResults, { SelectedFilter } from './components/SearchResults';
import MarkdownViewer from './components/MarkdownViewer';
import { useAppDispatch, useAppSelector } from '@mds/common/redux/rootState';
import { selectSearchResults, selectSearchLoading, selectSearchQuery, selectSearchFilters, selectAiLoading, searchPermitConditions, } from '@mds/common/redux/slices/permitSearchSlice';
import PermitConditionSearchSplashScreen from './components/PermitConditionSearchSplashScreen';
import FormWrapper from '@mds/common/components/forms/FormWrapper';
import { FORM } from '@mds/common/constants/forms';
import { debounce } from 'lodash';
import { change } from '@mds/common/components/forms/form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress } from '@fortawesome/pro-solid-svg-icons';

const PermitConditionSearch: React.FC = () => {
    const dispatch = useAppDispatch();
    const results = useAppSelector(selectSearchResults);
    const loading = useAppSelector(selectSearchLoading);
    const aiLoading = useAppSelector(selectAiLoading);
    const query = useAppSelector(selectSearchQuery);
    const selectedFilters = useAppSelector(selectSearchFilters);
    const [isAIResponseExpanded, setIsAIResponseExpanded] = useState(false);

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
                    <Row gutter={[16, 24]} style={{ width: '100%' }}>
                        <Col span={24}>
                            <Typography.Title level={1} style={{ marginBottom: 0 }}>
                                Permit Condition Search
                            </Typography.Title>
                        </Col>
                        <Col span={24}>
                            <SearchBox
                                onSearch={query => debouncedSearch(query, selectedFilters)}
                                loading={loading}
                            />
                        </Col>
                        <Col span={24}>
                            <Row className="permit-search__results-container" gutter={[16, 0]}>
                                <Col span={isAIResponseExpanded ? 8 : 16}>
                                    <SearchResults
                                        onFilterChange={filters => debouncedSearch(query, filters)}
                                    />
                                </Col>
                                <Col span={isAIResponseExpanded ? 16 : 8}>
                                    <Card
                                        title="AI-Generated Response"
                                        loading={false} // Don't use Card's loading state
                                        className={`permit-search__ai-response ${isAIResponseExpanded ? 'permit-search__ai-response--expanded' : ''}`}
                                    >
                                        <FontAwesomeIcon
                                            icon={isAIResponseExpanded ? faCompress : faExpand}
                                            onClick={() => setIsAIResponseExpanded(!isAIResponseExpanded)}
                                            className="expand-button"
                                            title={isAIResponseExpanded ? "Compress" : "Expand"}
                                        />
                                        {aiLoading ? (
                                            <Skeleton active paragraph={{ rows: 3 }} />
                                        ) : (
                                            results?.prompt?.answers?.map((result) => (
                                                <MarkdownViewer
                                                    key={`prompt-${result.substring(0, 20)}`}
                                                    markdown={result}
                                                />
                                            ))
                                        )}
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
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
