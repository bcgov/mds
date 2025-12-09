import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import { Tooltip, Tag } from 'antd';
import { HaystackDocumentSearchResult } from '@mds/common/interfaces/search/facet-search.interface';

interface MarkdownViewerProps {
    markdown: string;
    documents?: HaystackDocumentSearchResult[];
    referenceMap?: Map<string, number>;
    onReferenceClick?: (id: string) => void;
}

// Matches references in the format [doc:hash1, doc:hash2, ...] or [[doc:hash, doc:hash, ...]]
const referenceRegex = /\[(?:doc:([a-f0-9-]+)(?:\s*,\s*doc:([a-f0-9-]+))*)\]|\[\[doc:([a-f0-9-]+)\]\]/g;

// Replaces references with actual links to the corresponding condition.
// Example: [doc:abc123], [doc:def567] -> [1](#abc123) [2](#def567)
const processReferences = (markdown: string, referenceMap?: Map<string, number>) => {
    let refCount = 0;
    return markdown.replace(referenceRegex, (match, ...args) => {
        const hashes = args.slice(0, -2).filter(Boolean);

        return hashes.map(hash => {
            let num;
            if (referenceMap) {
                num = referenceMap.get(hash) || '?';
            } else {
                refCount++;
                num = refCount;
            }
            return `[${num}](#condition-${hash})`;
        }).join(' ');
    });
};

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown, documents = [], referenceMap, onReferenceClick }) => {
    const processedMarkdown = useMemo(() => {
        return processReferences(markdown, referenceMap);
    }, [markdown, referenceMap]);

    // Smoothly scroll to the condition when a reference is clicked.
    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        event.preventDefault();
        if (onReferenceClick) {
            onReferenceClick(hash);
            return;
        }

        const element = document.getElementById(`condition-${hash}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            window.location.hash = `condition-${hash}`;
        }
    };

    const components: any = {
        a: ({ node, href, children, ...props }: any) => {
            if (href && href.startsWith('#condition-')) {
                const id = href.replace('#condition-', '');
                const doc = documents.find(d => d.id === id);

                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                    handleLinkClick(e, id);
                };

                if (doc) {
                    const tooltipContent = (
                        <div>
                            <div><strong>Mine:</strong> {doc.meta.mine_name}</div>
                            <div><strong>Permit:</strong> {doc.meta.permit}</div>
                            <div><strong>Score:</strong> {Math.round(((doc.score - 1) / 3) * 100)}%</div>
                        </div>
                    );

                    return (
                        <Tooltip title={tooltipContent} mouseEnterDelay={0.5}>
                            <a href={href} onClick={handleClick} {...props} style={{ textDecoration: 'none', margin: '0 2px', display: 'inline-block' }}>
                                <Tag color="blue" style={{ cursor: 'pointer', marginRight: 0 }}>
                                    {children}
                                </Tag>
                            </a>
                        </Tooltip>
                    );
                }

                return (
                    <a href={href} onClick={handleClick} {...props} style={{ textDecoration: 'none', margin: '0 2px', display: 'inline-block' }}>
                        <Tag color="default" style={{ cursor: 'pointer', marginRight: 0 }}>
                            {children}
                        </Tag>
                    </a>
                );
            }
            return <a href={href} {...props}>{children}</a>;
        }
    };

    return (
        <div className="permit-search__markdown" role="none">
            <div data-testid="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                    {processedMarkdown}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default MarkdownViewer;