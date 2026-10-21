import React, { FC, ReactNode } from "react";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import ExclamationCircleOutlined from "@ant-design/icons/ExclamationCircleOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";

import { CALLOUT_SEVERITY } from "@mds/common/constants/strings";

interface CallOutProps {
  message: string | ReactNode;
  title?: string;
  severity?: string;
  showIcon?: boolean;
}

const SEVERITY_ICONS = {
  [CALLOUT_SEVERITY.info]: InfoCircleOutlined,
  [CALLOUT_SEVERITY.success]: CheckCircleOutlined,
  [CALLOUT_SEVERITY.warning]: ExclamationCircleOutlined,
  [CALLOUT_SEVERITY.danger]: CloseCircleOutlined,
};

const Callout: FC<CallOutProps> = ({
  message,
  title,
  severity = CALLOUT_SEVERITY.info,
  showIcon = false,
}) => {
  const formattedMessage = typeof message === "string" ? <p>{message}</p> : message;
  const Icon = SEVERITY_ICONS[severity] ?? InfoCircleOutlined;

  const content = (
    <>
      {title && <p className="bcgov-callout-title">{title}</p>}
      {formattedMessage}
    </>
  );

  if (!showIcon) {
    return <div className={`bcgov-callout--${severity} bcgov-callout`}>{content}</div>;
  }

  return (
    <div className={`bcgov-callout--${severity} bcgov-callout bcgov-callout--with-icon`}>
      <Icon className="bcgov-callout-icon" aria-hidden="true" />
      <div className="bcgov-callout-content">{content}</div>
    </div>
  );
};

export default Callout;
