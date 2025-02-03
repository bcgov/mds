import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { HaystackDocumentSearchResult } from '../services/types';

const { Text, Paragraph } = Typography;

const ResultItem: React.FC<{ result: HaystackDocumentSearchResult }> = ({ result }) => {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph strong>{result.content}</Paragraph>
            <Space>
                {result.meta?.categories?.map((category) => (
                    <Tag key={category}>{category}</Tag>
                ))}
                {result.meta?.source && (
                    <Text type="secondary">Source: {result.meta.source}</Text>
                )}
            </Space>
        </Space>
    );
};

export default ResultItem;