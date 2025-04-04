import { faInfoCircle, faWarning } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Col, Row } from "antd";
import React, { FC, useMemo } from "react";
import { useAppSelector } from "@mds/common/redux/rootState";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";

interface PermitReviewBannerProps {
  isExtracted: boolean;
  height: number;
  isReviewComplete: boolean;
}

export const PermitReviewBanner: FC<PermitReviewBannerProps> = ({
  isExtracted,
  height,
  isReviewComplete,
}) => {
  const isCore = useAppSelector(getIsCore);

  const completeParams = {
    text: "Conditions were extracted using AI and have been reviewed and verified.",
    className: "complete",
    icon: faInfoCircle,
  };

  const mineSpaceParams = {
    text: "Permit conditions have been extracted using AI and reviewed by inspector. These conditions are for reference only and cannot be used as legal requirements. The issued permit remains the official source of truth.",
    className: "incomplete",
    icon: faWarning,
  };

  const incompleteParams = {
    text: "Conditions and their report requirements have been extracted using AI and require review and verification.",
    className: "incomplete",
    icon: faWarning,
  };

  const draftedCoreParams = {
    ...completeParams,
    text: "This permit was drafted and issued in Core; conditions cannot be modified.",
  };

  const paramsToUse = useMemo(() => {
    if (!isCore) {
      return mineSpaceParams;
    }
    if (isExtracted) {
      return isReviewComplete ? completeParams : incompleteParams;
    } else {
      return draftedCoreParams;
    }
  }, [isExtracted, isReviewComplete, isCore]);

  return (
    <>
      <Row
        justify="center"
        align="middle"
        gutter={16}
        className={`permit-status-banner permit-status-banner--${paramsToUse.className}`}
        style={{
          height,
        }}
      >
        <Col>{<FontAwesomeIcon icon={paramsToUse.icon} />}</Col>
        <Col span={23}>{paramsToUse.text}</Col>
      </Row>
      <div
        style={{
          height,
        }}
      ></div>
    </>
  );
};
