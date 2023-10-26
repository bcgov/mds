import React, { FC } from "react";
import { Tooltip } from "antd";
import { COLOR } from "@/constants/styles";
import { WarningOutlined, InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";

interface CoreTooltipProps {
  title: string;
  iconColor?: string;
  icon?: "exclamation" | "question";
}

export const CoreTooltip: FC<CoreTooltipProps> = ({
  title,
  iconColor = COLOR.violet,
  icon = "exclamation",
}) => (
  <Tooltip title={title} placement="right" mouseEnterDelay={0.3} overlayClassName="core-tooltip">
    {icon === "exclamation" ? (
      <InfoCircleOutlined className="info-tooltip icon-sm" style={{ color: iconColor }} />
    ) : (
      <QuestionCircleOutlined className="info-tooltip icon-sm" style={{ color: iconColor }} />
    )}
  </Tooltip>
);

export const NOWFieldOriginTooltip = () => (
  <Tooltip
    title="This field was not being sent by NROS or vFCBC. Only applications pushed directly from vFCBC will have this value. Open the original PDF to see the data."
    placement="right"
    mouseEnterDelay={0.3}
  >
    <WarningOutlined className="info-tooltip icon-sm" />
  </Tooltip>
);

interface NOWOriginalValueTooltipProps {
  originalValue: string;
  isVisible: boolean;
  style?: any;
}

export const NOWOriginalValueTooltip: FC<NOWOriginalValueTooltipProps> = ({
  originalValue,
  isVisible,
  style = {},
}) => (
  <Tooltip
    title={`Original Value: ${originalValue}`}
    placement="right"
    mouseEnterDelay={0.3}
    className={!style?.marginLeft && "position-right"}
  >
    {isVisible && (
      <span style={style} className="violet">
        Edited
      </span>
    )}
  </Tooltip>
);
