import React from "react";
import { Tooltip } from "antd";
import { INFO_CIRCLE } from "@/constants/assets";

export const NOWFieldOriginTooltip = () => (
  <Tooltip
    title="This field is not being sent by NROS or vFCBC. Open the original PDF to to see the data."
    placement="right"
    mouseEnterDelay={0.3}
  >
    <img src={INFO_CIRCLE} alt="Info" className="info-tooltip" />
  </Tooltip>
);

export default NOWFieldOriginTooltip;
