import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Tag, Row, Col, Button } from 'antd';
import { ContextItem, HaystackDocumentSearchResult } from '@mds/common/src/interfaces/search/facet-search.interface';
import dayjs from 'dayjs';
import { formatPermitConditionStep } from '@mds/common/utils/helpers';
import MarkdownViewer from './MarkdownViewer';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openModal } from '@mds/common/redux/actions/modalActions';
import { VIEW_MINE_PERMIT_AMENDMENT } from '@/constants/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye,
    faArrowUpRightFromSquare,
    faChevronDown,
    faChevronUp
} from '@fortawesome/pro-solid-svg-icons';
import PermitAmendmentPreviewModal from './PermitAmendmentPreviewModal';
import DocumentLink from '@mds/common/components/documents/DocumentLink';
import { ActionMenuButton } from '@mds/common/components/common/ActionMenu';


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
        // Highlight conditions when url changes.
        // E.g. /conditions/#condition-123 will highlight condition with id 123 for 5 seconds
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === `#condition-${result.id}`) {
                setIsHighlighted(true);
                setTimeout(() => setIsHighlighted(false), 5000);
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [result.id]);

    // Normalize score from 1-4 range to 0-100%
    const normalizedScore = useMemo(() => {
        const minScore = 1;
        const maxScore = 4;
        return Math.round(((score - minScore) / (maxScore - minScore)) * 100);
    }, [score]);

    const pathParts = [
        ...(meta.step_path ? [meta.step_path.split('.')[0]] : [])
    ].filter(Boolean);

    const contentToDisplay = formatPermitConditionStep(meta.step, highlightedResult || content);

    const actionItems = [
        {
            key: 'preview',
            label: 'Preview Permit',
            icon: <FontAwesomeIcon icon={faEye} />,
            clickFunction: handlePreviewPermit
        },
        {
            key: 'navigate',
            label: 'Go to Permit',
            icon: <FontAwesomeIcon icon={faArrowUpRightFromSquare} />,
            clickFunction: handleNavigateToPermit
        }
    ];

    const renderContextItem = (item: ContextItem, isChild = false) => (
        <Row
            key={item.id}
            className={`permit-search__context-item ${isChild ? 'permit-search__context-item--child' : ''}`}
            gutter={0}
            data-testid={`context-item-${item.id}`}
        >
            <Col flex="auto" className="permit-search__context-content">
                {item.step ? `${item.step}. ` : ''}
                {item.content}
            </Col>
        </Row>
    );

    const renderExpandLink = (direction: 'above' | 'below', count: number) => (
        <Button
            onClick={() => setExpandedContext(direction)}
            className="permit-search__expand-link"
            type="link"
            data-testid={`expand-${direction}-contexts`}
        >
            <FontAwesomeIcon
                icon={direction === 'above' ? faChevronUp : faChevronDown}
                style={{ marginRight: '4px' }}
            />
            {`Show ${count}`}
        </Button>
    );

    const renderContexts = () => {
        const parentContexts = meta.context?.parent_contexts ? Object.values(meta.context.parent_contexts) : [];
        const prevSiblings = meta.context?.sibling_contexts?.previous || [];
        const nextSiblings = meta.context?.sibling_contexts?.next || [];
        const childContexts = meta.context?.child_contexts || [];

        const aboveContexts = [...parentContexts, ...prevSiblings].sort((a, b) =>
            (a.step || '').localeCompare(b.step || '')
        );
        const belowContexts = [...childContexts, ...nextSiblings];

        const defaultAboveContext = parentContexts[parentContexts.length - 1];
        const defaultBelowContext = belowContexts[0];

        return (
            <Row className="permit-search__context-container" gutter={[0, 6]}>
                {aboveContexts.length > 0 && (
                    <Col span={24} className="permit-search__context-section">
                        {expandedContext === 'above' ? (
                            <Row gutter={[0, 8]}>
                                {aboveContexts.map((item, index) => (
                                    <Col span={24} key={item.id}>
                                        <Row justify="space-between" align="top">
                                            <Col flex="auto">
                                                {renderContextItem(item)}
                                            </Col>
                                            {index === 0 && (
                                                <Col>
                                                    <Button
                                                        onClick={() => setExpandedContext(null)}
                                                        className="permit-search__expand-link"
                                                        type="link"
                                                    >
                                                        <FontAwesomeIcon icon={faChevronUp} style={{ marginRight: '4px' }} />
                                                        Show less
                                                    </Button>
                                                </Col>
                                            )}
                                        </Row>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Row justify="space-between" align="top">
                                <Col flex="auto">
                                    {defaultAboveContext && renderContextItem(defaultAboveContext)}
                                </Col>
                                <Col>
                                    {aboveContexts.length > 1 && renderExpandLink('above', aboveContexts.length - 1)}
                                </Col>
                            </Row>
                        )}
                    </Col>
                )}

                <Col span={24}>
                    {highlightedResult ? <MarkdownViewer markdown={contentToDisplay} /> : contentToDisplay}
                </Col>

                {belowContexts.length > 0 && (
                    <Col span={24}>
                        {expandedContext === 'below' ? (
                            <Row gutter={[0, 8]}>
                                {belowContexts.map((item, index) => (
                                    <Col span={24} key={item.id}>
                                        <Row justify="space-between" align="top">
                                            <Col flex="auto">
                                                {renderContextItem(item)}
                                            </Col>
                                            {index === belowContexts.length - 1 && (
                                                <Col>
                                                    <Button
                                                        onClick={() => setExpandedContext(null)}
                                                        className="permit-search__expand-link"
                                                        type="link"
                                                    >
                                                        <FontAwesomeIcon icon={faChevronDown} style={{ marginRight: '4px' }} />
                                                        Show less
                                                    </Button>
                                                </Col>
                                            )}
                                        </Row>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Row justify="space-between" align="top">
                                <Col flex="auto">
                                    {defaultBelowContext && renderContextItem(defaultBelowContext)}
                                </Col>
                                <Col>
                                    {belowContexts.length > 1 && renderExpandLink('below', belowContexts.length - 1)}
                                </Col>
                            </Row>
                        )}
                    </Col>
                )}
            </Row>
        );
    };

    return (
        <Row
            id={`condition-${result.id}`}
            className={`permit-search__result-item ${isHighlighted ? 'permit-search__result-item--highlighted' : ''}`}
            gutter={[0, 0]}
        >
            <Col span={24}>
                <Row justify="space-between" align="top">
                    <Col>
                        <div data-testid="path-section">
                            {pathParts?.join(' > ')}
                        </div>
                    </Col>
                    <Col>
                        <ActionMenuButton
                            buttonText="Actions"
                            dataTestId="condtions-action-button"
                            actions={actionItems}
                            useEllipsis={true}
                        />
                    </Col>
                </Row>
            </Col>

            <Col span={24} style={{ marginBottom: '8px' }}>
                {renderContexts()}
            </Col>

            <Col span={24}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Row gutter={[8, 8]} wrap>
                            <Col>
                                <Tag
                                    color="blue"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onFilterClick?.('mine_name', meta.mine_name)}
                                >
                                    {meta.mine_name}
                                </Tag>
                            </Col>
                            <Col>
                                <Tag
                                    color="geekblue"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onFilterClick?.('permit', meta.permit)}
                                >
                                    {meta.permit}
                                </Tag>
                            </Col>
                            <Col>
                                <Tag
                                    color="purple"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onFilterClick?.('mine_number', meta.mine_number)}
                                >
                                    {meta.mine_number}
                                </Tag>
                            </Col>
                            <Col>
                                <Tag
                                    color="magenta"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onFilterClick?.('permit_type', meta.permit_type)}
                                >
                                    {meta.permit_type}
                                </Tag>
                            </Col>
                        </Row>
                    </Col>

                    <Col>
                        <Row gutter={16} align="middle">
                            <Col>
                                <Typography.Text type="secondary" className="permit-search__document-info">
                                    <DocumentLink
                                        unstyled={true}
                                        documentManagerGuid={meta.document_manager_guid}
                                        documentName={meta.document_name}
                                        truncateDocumentName={false}
                                    />
                                </Typography.Text>
                            </Col>
                            <Col>
                                <Typography.Text type="secondary" className="permit-search__document-info">
                                    {dayjs(meta.issue_date).format('MMM D, YYYY')}
                                </Typography.Text>
                            </Col>
                            <Col>
                                <Tag color="green">{normalizedScore}% match</Tag>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default ResultItem;