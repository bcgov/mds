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
    className="compressionProgressBar"
    style={{
      top: `${props.notificationTopPosition - 11}px`,
    }}
  />
);

export default CompressionNotificationProgressBar;
