import React, { useState } from "react";
import { Image, Typography } from "antd";

interface ArtifactImagePreviewProps {
    src: string;
    alt: string;
    imageClassName?: string;
    wrapperClassName?: string;
}

const ArtifactImagePreview: React.FC<ArtifactImagePreviewProps> = ({
    src,
    alt,
    imageClassName,
    wrapperClassName,
}) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className={wrapperClassName}>
                <Typography.Text type="secondary" className="now-search__artifact-preview-fallback">
                    Preview unavailable. Open the document for the full artifact.
                </Typography.Text>
            </div>
        );
    }

    return (
        <div className={wrapperClassName}>
            <Image
                src={src}
                alt={alt}
                className={imageClassName}
                preview={{
                    mask: <span className="now-search__artifact-preview-mask">Open full preview</span>,
                }}
                onError={() => setHasError(true)}
            />
        </div>
    );
};

export default ArtifactImagePreview;