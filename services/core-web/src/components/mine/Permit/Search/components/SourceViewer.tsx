import React from 'react';

interface SourceViewerProps {
    source: {
        title: string;
        content: string;
        link: string;
    };
}

const SourceViewer: React.FC<SourceViewerProps> = ({ source }) => {
    return (
        <div>
            <h2>{source.title}</h2>
            <div>{source.content}</div>
            <a href={source.link} target="_blank" rel="noopener noreferrer">
                View Source
            </a>
        </div>
    );
};

export default SourceViewer;