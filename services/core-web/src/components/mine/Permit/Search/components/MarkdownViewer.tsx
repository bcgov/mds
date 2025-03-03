import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
    markdown: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown }) => {
    return (
        <div className="permit-search__markdown">
            <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
    );
};
export default MarkdownViewer;