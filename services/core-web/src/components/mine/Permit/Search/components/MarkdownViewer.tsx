import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'

interface MarkdownViewerProps {
    markdown: string;
}

// Matches references in the format [doc:hash1, doc:hash2, ...] or [[doc:hash, doc:hash, ...]]
const referenceRegex = /\[(?:doc:([a-f0-9-]+)(?:\s*,\s*doc:([a-f0-9-]+))*)\]|\[\[doc:([a-f0-9-]+)\]\]/g;

// Replaces references with actual links to the corresponding condition.
// Example: [doc:abc123], [doc:def567] -> [1](#abc123) [2](#def567)
const processReferences = (markdown: string) => {
    let refCount = 0;
    return markdown.replace(referenceRegex, (match, ...args) => {
        const hashes = args.slice(0, -2).filter(Boolean);

        return hashes.map(hash => {
            refCount++;
            return `[[${refCount}]](#condition-${hash})`;
        }).join(' ');
    });
};

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown }) => {
    const processedMarkdown = useMemo(() => {
        return processReferences(markdown);
    }, [markdown]);

    // Smoothly scroll to the condition when a reference is clicked.
    const handleClick = (event: React.MouseEvent | React.KeyboardEvent) => {
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
        <div className="permit-search__markdown" onClick={handleClick} onKeyDown={handleClick} role="none">
            <div data-testid="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {processedMarkdown}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default MarkdownViewer;