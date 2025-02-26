import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Space, Tag, Row, Col, Button } from 'antd';
import { ContextItem, HaystackDocumentSearchResult } from '@mds/common/src/interfaces/search/facet-search.interface';
import dayjs from 'dayjs';
import { formatPermitConditionStep } from '@mds/common/utils/helpers';
import MarkdownViewer from './MarkdownViewer';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openModal } from '@mds/common/redux/actions/modalActions';
import { VIEW_MINE_PERMIT_AMENDMENT } from '@/constants/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faArrowUpRightFromSquare, faChevronDown, faChevronUp } from '@fortawesome/pro-solid-svg-icons';
import PermitAmendmentPreviewModal from './PermitAmendmentPreviewModal';
import DocumentLink from '@mds/common/components/documents/DocumentLink';

const { Text, Paragraph } = Typography;

interface ResultItemProps {
    result: HaystackDocumentSearchResult;
    onFilterClick?: (category: string, value: string) => void;
}

const ResultItem: React.FC<ResultItemProps> = ({ result, onFilterClick }) => {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [expandedContext, setExpandedContext] = useState<'above' | 'below' | null>(null);
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
        ...(meta.step_path ? meta.step_path.split('.') : [])
    ].filter(Boolean);

    const contentToDisplay = formatPermitConditionStep(meta.step, highlightedResult || content);

    const permitUrl = VIEW_MINE_PERMIT_AMENDMENT.dynamicRoute(
        meta.mine_guid,
        meta.permit_guid,
        meta.permit_amendment_guid,
        'conditions'
    );

    const renderContextItem = (item: ContextItem, isChild = false) => (
        <div
            key={item.id}
            style={{
                color: 'rgba(0, 0, 0, 0.45)',
                fontSize: '14px',
                marginLeft: isChild ? '24px' : '0',
                padding: '8px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}
        >
            <div style={{ flex: 1 }}>
                {item.step ? `${item.step}. ` : ''}
                {item.content}
            </div>
        </div>
    );

    const renderExpandLink = (direction: 'above' | 'below', count: number) => (
        <a
            onClick={() => setExpandedContext(direction)}
            style={{
                color: 'rgba(0, 0, 0, 0.45)',
                fontSize: '13px',
                cursor: 'pointer',
                marginLeft: '8px',
                whiteSpace: 'nowrap'
            }}
        >
            <FontAwesomeIcon
                icon={direction === 'above' ? faChevronUp : faChevronDown}
                style={{ marginRight: '4px' }}
            />
            {`Show ${count}`}
        </a>
    );

    const renderContexts = () => {
        const parentContexts = meta.context?.parent_contexts ? Object.values(meta.context.parent_contexts) : [];
        const prevSiblings = meta.context?.sibling_contexts?.previous || [];
        const nextSiblings = meta.context?.sibling_contexts?.next || [];
        const childContexts = meta.context?.child_contexts || [];

        const aboveContexts = [...parentContexts, ...prevSiblings];
        const belowContexts = [...childContexts, ...nextSiblings];

        const defaultAboveContext = aboveContexts[aboveContexts.length - 1];
        const defaultBelowContext = belowContexts[0];

        return (
            <div style={{ marginTop: '8px' }}>  {/* reduced from 16px */}
                {/* Above contexts */}
                {aboveContexts.length > 0 && (
                    <div style={{ marginBottom: '4px' }}>  {/* reduced from 8px */}
                        {expandedContext === 'above' ? (
                            <>
                                {aboveContexts.map((item, index) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        {renderContextItem(item)}
                                        {index === 0 && (
                                            <a
                                                onClick={() => setExpandedContext(null)}
                                                style={{
                                                    color: 'rgba(0, 0, 0, 0.45)',
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    marginLeft: '8px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faChevronUp} style={{ marginRight: '4px' }} />
                                                Show less
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                {defaultAboveContext && renderContextItem(defaultAboveContext)}
                                {aboveContexts.length > 1 && renderExpandLink('above', aboveContexts.length - 1)}
                            </div>
                        )}
                    </div>
                )}

                {/* Main content */}
                {highlightedResult ? <MarkdownViewer markdown={contentToDisplay} /> : contentToDisplay}

                {/* Below contexts */}
                {belowContexts.length > 0 && (
                    <div>
                        {expandedContext === 'below' ? (
                            <>
                                {belowContexts.map((item, index) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        {renderContextItem(item)}
                                        {index === belowContexts.length - 1 && (
                                            <a
                                                onClick={() => setExpandedContext(null)}
                                                style={{
                                                    color: 'rgba(0, 0, 0, 0.45)',
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    marginLeft: '8px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faChevronDown} style={{ marginRight: '4px' }} />
                                                Show less
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                {defaultBelowContext && renderContextItem(defaultBelowContext)}
                                {belowContexts.length > 1 && renderExpandLink('below', belowContexts.length - 1)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

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

                {renderContexts()}
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