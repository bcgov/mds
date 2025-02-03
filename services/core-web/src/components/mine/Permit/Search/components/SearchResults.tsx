import React from 'react';
import { List, Card, Tag, Typography, Skeleton } from 'antd';
import { SearchResultsProps } from '../services/types';
import ResultItem from './ResultItem';

const { Text } = Typography;

const SearchResults: React.FC<SearchResultsProps & { loading?: boolean }> = ({
    results,
    loading
}) => {
    return (
        <Card title="Permit Conditions" loading={loading}>
            <List
                itemLayout="vertical"
                dataSource={results?.documents || []}
                locale={{ emptyText: 'No results found' }}
                renderItem={(result) => (
                    <List.Item
                        extra={
                            <Tag color="blue">
                                Score: {Math.round(result.score * 100)}%
                            </Tag>
                        }
                    >
                        <ResultItem result={result} />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default SearchResults;