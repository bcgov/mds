import React, { useState, useMemo } from 'react';
import { Tabs } from 'antd';
import { HaystackDocumentSearchResult } from '@mds/common/interfaces/search/facet-search.interface';
import MarkdownViewer from './MarkdownViewer';
import ResultItem from './ResultItem';

interface AiResponseViewerProps {
    answer: string;
    documents: HaystackDocumentSearchResult[];
}

const AiResponseViewer: React.FC<AiResponseViewerProps> = ({ answer, documents }) => {
    const [activeTab, setActiveTab] = useState('response');

    // Extract references and assign numbers
    const { references, referenceMap } = useMemo(() => {
        const referenceRegex = /\[(?:doc:([a-f0-9-]+)(?:\s*,\s*doc:([a-f0-9-]+))*)\]|\[\[doc:([a-f0-9-]+)\]\]/g;
        const foundIds = new Set<string>();
        const refs: { id: string; number: number; doc?: HaystackDocumentSearchResult }[] = [];
        const map = new Map<string, number>();

        let nextNum = 1;

        // We want to find all matches in order
        let m;
        // Reset regex lastIndex if it was global, but here we create new regex or use matchAll
        // matchAll is ES2020. Let's use exec loop.
        const regex = new RegExp(referenceRegex);

        let tempAnswer = answer;
        while ((m = regex.exec(tempAnswer)) !== null) {
            const args = m.slice(1).filter(Boolean);
            args.forEach(id => {
                if (!foundIds.has(id)) {
                    foundIds.add(id);
                    const doc = documents.find(d => d.id === id);
                    map.set(id, nextNum);
                    refs.push({ id, number: nextNum, doc });
                    nextNum++;
                }
            });
            // Advance past the match to avoid infinite loop if regex doesn't consume
            // But exec on global regex advances lastIndex. 
            // Wait, referenceRegex in MarkdownViewer is global (/g).
            // Here I created new RegExp(referenceRegex) which copies flags?
            // No, new RegExp(/.../g) copies flags in modern JS.
            // Let's be safe.
            if (!regex.global) {
                break; // Should be global
            }
        }

        return { references: refs, referenceMap: map };
    }, [answer, documents]);

    const handleReferenceClick = (id: string) => {
        setActiveTab(`source-${id}`);
    };

    const items = [
        {
            label: 'Response',
            key: 'response',
            children: (
                <div style={{ padding: '16px' }}>
                    <MarkdownViewer
                        markdown={answer}
                        documents={documents}
                        referenceMap={referenceMap}
                        onReferenceClick={handleReferenceClick}
                    />
                </div>
            ),
        },
        ...references.map(ref => ({
            label: `Source ${ref.number}`,
            key: `source-${ref.id}`,
            children: ref.doc ? (
                <div style={{ padding: '16px' }}>
                    <ResultItem result={ref.doc} />
                </div>
            ) : (
                <div style={{ padding: '16px' }}>Source document not found.</div>
            )
        }))
    ];

    return (
        <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            type="card"
            className="permit-search__ai-tabs"
        />
    );
};

export default AiResponseViewer;
