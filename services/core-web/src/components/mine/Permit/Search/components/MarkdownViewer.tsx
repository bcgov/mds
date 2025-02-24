import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'

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

        // Handle both single and comma-separated doc references
        processed = processed.replace(/\[(?:doc:([a-f0-9-]+)(?:\s*,\s*doc:([a-f0-9-]+))*)\]|\[\[doc:([a-f0-9-]+)\]\]/g, (match, ...args) => {
            // Remove undefined values and the last two items (offset, string) from args
            const hashes = args.slice(0, -2).filter(Boolean);

            // Create references for each hash
            return hashes.map(hash => {
                refCount++;
                return `[[${refCount}]](#condition-${hash})`;
            }).join(' ');
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {processedMarkdown}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownViewer;