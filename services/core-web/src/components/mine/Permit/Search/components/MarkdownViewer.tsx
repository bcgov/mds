import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography } from 'antd';

const { Title } = Typography;

interface MarkdownViewerProps {
    markdown: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown }) => {
    const processedMarkdown = useMemo(() => {
        let refCount = 0;

        // First, escape any existing markdown brackets to prevent conflicts
        let processed = markdown.replace(/\[([^\]]*)\]/g, (match) => {
            if (!match.includes('doc:')) {
                return `\\${match}`;
            }
            return match;
        });

        // Then process our special doc references
        processed = processed.replace(/\[doc:([a-f0-9-]+)\]|\[\[doc:([a-f0-9-]+)\]\]/g, (match, hash1, hash2) => {
            refCount++;
            const hash = hash1 || hash2;
            return `[[${refCount}]](#condition-${hash})`;
        });

        return processed;
    }, [markdown]);

    const handleClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLAnchorElement;
        if (target.tagName === 'A' && target.href.includes('#condition-')) {
            event.preventDefault();
            const hash = target.href.split('#')[1];
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.location.hash = hash;
            }
        }
    };

    return (
        <div className="permit-search__markdown" onClick={handleClick}>
            <ReactMarkdown>
                {processedMarkdown}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownViewer;