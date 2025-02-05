import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
    markdown: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown }) => {
    return (
        <div className="markdown-viewer" style={{
            padding: '16px 0',
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#262626'
        }}>
            <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
    );
};
export default MarkdownViewer;