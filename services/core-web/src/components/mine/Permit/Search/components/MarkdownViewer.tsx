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
        const processed = markdown.replace(/\[doc:([a-f0-9]+)\]/g, (match, hash) => {
            refCount++;
            // Add onclick handler via data attribute
            return `[[${refCount}]](#condition-${hash})`;
        });
        return processed;
    }, [markdown]);

    const handleClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLAnchorElement;
        if (target.tagName === 'A' && target.dataset.conditionId) {
            event.preventDefault();
            const elementId = `condition-${target.dataset.conditionId}`;
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.location.hash = elementId; // This will trigger the highlight
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