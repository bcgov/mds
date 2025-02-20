import React, { useEffect, useState } from 'react';
import { Typography, Space, Tag, Row, Col } from 'antd';
import { HaystackDocumentSearchResult } from '@mds/common/src/interfaces/search/facet-search.interface';
import dayjs from 'dayjs';
import { formatPermitConditionStep } from '@mds/common/utils/helpers';
import MarkdownViewer from './MarkdownViewer';

const { Text, Paragraph } = Typography;

interface ResultItemProps {
    result: HaystackDocumentSearchResult;
    onFilterClick?: (category: string, value: string) => void;
}

const ResultItem: React.FC<ResultItemProps> = ({ result, onFilterClick }) => {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const { content, meta, score } = result;

    const highlightedResult = meta?.highlights?.content?.join('\n');

    useEffect(() => {
        // Check if this item's ID is in the URL hash
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === `#condition-${result.id}`) {
                setIsHighlighted(true);
                // Reset highlight after animation
                setTimeout(() => setIsHighlighted(false), 2000);
            }
        };

        handleHashChange(); // Check initial hash
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [result.id]);

    // Build breadcrumb path from category and step_path
    const pathParts = [
        meta.category,
        ...(meta.step_path ? meta.step_path.split('/') : [])
    ].filter(Boolean);

    const contentToDisplay = formatPermitConditionStep(meta.step, highlightedResult || content);

    return (
        <Row
            id={`condition-${result.id}`}
            className={isHighlighted ? 'highlight-condition' : ''}
            style={{
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f0f0f0'
            }}
        >
            <Col span={24}>
                {pathParts?.join(' > ')}

                <Paragraph>
                    {highlightedResult ? <MarkdownViewer markdown={contentToDisplay} /> : contentToDisplay}
                </Paragraph>
            </Col>

            <Col span={24}>
                <Row justify="space-between" align="middle">
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
            </Col>
        </Row>
    );
};

export default ResultItem;