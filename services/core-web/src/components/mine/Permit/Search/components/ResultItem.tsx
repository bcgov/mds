import React from 'react';
import { Typography, Space, Tag, Row } from 'antd';
import { HaystackDocumentSearchResult } from '@mds/common/src/interfaces/search/facet-search.interface';
import dayjs from 'dayjs';
import { formatPermitConditionStep } from '@mds/common/utils/helpers';

const { Text, Paragraph } = Typography;

interface ResultItemProps {
    result: HaystackDocumentSearchResult;
    onFilterClick?: (category: string, value: string) => void;
}

const ResultItem: React.FC<ResultItemProps> = ({ result, onFilterClick }) => {
    const { content, meta, score } = result;

    // Build breadcrumb path from category and step_path
    const pathParts = [
        meta.category,
        ...(meta.step_path ? meta.step_path.split('/') : [])
    ].filter(Boolean);

    return (
        <Row
            style={{
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f0f0f0'
            }}
        >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {/* Breadcrumb path */}
                {pathParts?.join(' > ')}

                {/* Main content */}
                <Paragraph>
                    {formatPermitConditionStep(meta.step, content)}
                </Paragraph>

                {/* Metadata section */}
                <Row justify="space-between" align="middle">
                    {/* Interactive filter tags */}
                    <Space size={[0, 8]} wrap>
                        <Tag
                            color="blue"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onFilterClick?.('mine_name', meta.mine_name)}
                        >
                            {meta.mine_name}
                        </Tag>
                        <Tag
                            color="geekblue"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onFilterClick?.('permit', meta.permit)}
                        >
                            {meta.permit}
                        </Tag>
                        <Tag
                            color="purple"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onFilterClick?.('mine_number', meta.mine_number)}
                        >
                            {meta.mine_number}
                        </Tag>
                    </Space>

                    {/* Document info & date */}
                    <Space size="middle">
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {meta.document_name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {dayjs(meta.issue_date).format('MMM D, YYYY')}
                        </Text>
                        <Tag color="green">{Math.round(score * 100)}% match</Tag>
                    </Space>
                </Row>
            </Space>
        </Row>
    );
};

export default ResultItem;