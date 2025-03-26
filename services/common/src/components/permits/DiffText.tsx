import React from 'react';
import { Typography } from 'antd';
import { diffWords } from 'diff';

interface DiffTextProps {
    oldText: string;
    newText: string;
}

/**
 * DiffText component to show the difference between two texts using diffWords from js-diff
 * @param oldText the old text
 * @param newText the new text
 * @returns Text with differences highlighted
 */
const DiffText: React.FC<DiffTextProps> = ({ oldText, newText }) => {
    const differences = diffWords(oldText, newText);

    return (
        <Typography.Text>
            {differences.map((part, index) => {
                if (part.added) {
                    return <span key={index} className="diff-added">{part.value}</span>;
                }
                if (part.removed) {
                    return <span key={index} className="diff-removed">{part.value}</span>;
                }
                return <span key={index}>{part.value}</span>;
            })}
        </Typography.Text>
    );
};

export default DiffText;