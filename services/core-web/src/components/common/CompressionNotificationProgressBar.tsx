import React, { FC } from "react";
import { Progress } from "antd";

interface CompressionNotificationProgressBarProps {
  compressionProgress: number;
  notificationTopPosition: number;
}

export const CompressionNotificationProgressBar: FC<CompressionNotificationProgressBarProps> = (
  props
) => (
  <Progress
    percent={props.compressionProgress}
    showInfo={false}
    strokeColor={"#5e46a1"}
    strokeLinecap={"square"}
    trailColor="#d9d9d9"
    style={{
      width: "384px",
      position: "fixed",
      zIndex: 1005,
      top: `${props.notificationTopPosition - 10}px`,
      right: "0px",
      bottom: "auto",
      marginRight: "24px",
    }}
  />
);

export default CompressionNotificationProgressBar;
