import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Space, Tag, Row, Col, Button } from 'antd';
import { HaystackDocumentSearchResult } from '@mds/common/src/interfaces/search/facet-search.interface';
import dayjs from 'dayjs';
import { formatPermitConditionStep } from '@mds/common/utils/helpers';
import MarkdownViewer from './MarkdownViewer';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openModal } from '@mds/common/redux/actions/modalActions';
import { VIEW_MINE_PERMIT_AMENDMENT } from '@/constants/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faArrowUpRightFromSquare } from '@fortawesome/pro-solid-svg-icons';
import PermitAmendmentPreviewModal from './PermitAmendmentPreviewModal';
import DocumentLink from '@mds/common/components/documents/DocumentLink';

const { Text, Paragraph } = Typography;

interface ResultItemProps {
    result: HaystackDocumentSearchResult;
    onFilterClick?: (category: string, value: string) => void;
}

const ResultItem: React.FC<ResultItemProps> = ({ result, onFilterClick }) => {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const { content, meta, score } = result;

    const highlightedResult = meta?.highlights?.content?.join('\n');

    const history = useHistory();
    const dispatch = useDispatch();

    const handleNavigateToPermit = () => {
        history.push(VIEW_MINE_PERMIT_AMENDMENT.dynamicRoute(
            meta.mine_guid,
            meta.permit_guid,
            meta.permit_amendment_guid,
            'conditions'
        ));
    };

    const handlePreviewPermit = () => {
        dispatch(openModal({
            props: {
                title: 'Permit Amendment Preview',
                permitAmendmentGuid: meta.permit_amendment_guid,
                mineGuid: meta.mine_guid,
                permitGuid: meta.permit_guid,
                selectedConditionId: result.id, // Add this line
            },
            width: '90%',
            content: PermitAmendmentPreviewModal,
        }));
    };

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

    // Normalize score from 1-4 range to 0-100%
    const normalizedScore = useMemo(() => {
        const minScore = 1;
        const maxScore = 4;
        return Math.round(((score - minScore) / (maxScore - minScore)) * 100);
    }, [score]);

    // Build breadcrumb path from category and step_path
    const pathParts = [
        meta.category,
        ...(meta.step_path ? meta.step_path.split('/') : [])
    ].filter(Boolean);

    const contentToDisplay = formatPermitConditionStep(meta.step, highlightedResult || content);

    const permitUrl = VIEW_MINE_PERMIT_AMENDMENT.dynamicRoute(
        meta.mine_guid,
        meta.permit_guid,
        meta.permit_amendment_guid,
        'conditions'
    );

    return (
        <Row
            id={`condition-${result.id}`}
            className={isHighlighted ? 'highlight-condition' : ''}
            style={{
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f0f0f0',
                position: 'relative'
            }}
        >
            <Col span={24}>
                <Row justify="space-between" align="top">
                    <Col>{pathParts?.join(' > ')}</Col>
                    <Col>
                        <Space>
                            <span
                                onClick={handlePreviewPermit}
                                style={{
                                    cursor: 'pointer',
                                    color: 'rgba(0, 0, 0, 0.85)',
                                    fontSize: '14px',
                                }}
                                title="Preview Permit"
                            >
                                <FontAwesomeIcon icon={faEye} style={{ marginRight: '4px' }} />
                                Preview
                            </span>
                            <a
                                href={permitUrl}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigateToPermit();
                                }}
                                style={{
                                    color: 'rgba(0, 0, 0, 0.85)',
                                    fontSize: '14px',
                                    textDecoration: 'none'
                                }}
                                title="Go to Permit"
                            >
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginRight: '4px' }} />
                                Go to Permit
                            </a>
                        </Space>
                    </Col>
                </Row>

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
                            <DocumentLink
                                unstyled={true}
                                documentManagerGuid={meta.document_manager_guid}
                                documentName={meta.document_name}
                                truncateDocumentName={false}
                            />
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {dayjs(meta.issue_date).format('MMM D, YYYY')}
                        </Text>
                        <Tag color="green">{score}% match</Tag>
                    </Space >
                </Row >
            </Col >
        </Row >
    );
};

export default ResultItem;