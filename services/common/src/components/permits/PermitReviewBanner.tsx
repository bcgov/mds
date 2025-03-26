import { faInfoCircle, faWarning } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Col, Row } from "antd";
import React, { FC } from "react";

interface PermitReviewBannerProps {
    isExtracted: boolean;
    height: number;
    isReviewComplete: boolean;
};

export const PermitReviewBanner: FC<PermitReviewBannerProps> = ({
    isExtracted,
    height,
    isReviewComplete
}) => {
    const completeParams = {
        text: "Conditions were extracted using AI and have been reviewed and verified.",
        className: "complete",
        icon: faInfoCircle
    }

    const incompleteParams = {
        text: "Conditions and their report requirements have been extracted using AI and require review and verification.",
        className: "incomplete",
        icon: faWarning
    };

    const draftedCoreParams = {
        ...completeParams,
        text: "This permit was drafted and issued in Core; conditions cannot be modified."
    };

    const aiParams = isReviewComplete ? completeParams : incompleteParams;
    const paramsToUse = isExtracted ? aiParams : draftedCoreParams;

    return (<>
        <Row
            justify="center"
            align="middle"
            className={`permit-status-banner permit-status-banner--${paramsToUse.className}`}
            style={{
                height,
            }}
        >
            <Col>{<FontAwesomeIcon icon={paramsToUse.icon} />}</Col>
            <Col>{paramsToUse.text}</Col>
        </Row>
        <div
            style={{
                height
            }}
        ></div>
    </>);
};