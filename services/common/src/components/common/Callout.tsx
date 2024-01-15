import React, { FC, ReactNode } from "react";

import { CALLOUT_SEVERITY } from "@mds/common/constants/strings";

interface CallOutProps {
  message: string | ReactNode;
  title?: string;
  severity: string;
}

const Callout: FC<CallOutProps> = ({ message, title, severity = CALLOUT_SEVERITY.info }) => {
  const formattedMessage = typeof message === "string" ? <p>{message}</p> : message;

  return (
    <div className={`bcgov-callout--${severity} bcgov-callout`}>
      {title && <p className="bcgov-callout-title">{title}</p>}
      {formattedMessage}
    </div>
  );
};

export default Callout;
