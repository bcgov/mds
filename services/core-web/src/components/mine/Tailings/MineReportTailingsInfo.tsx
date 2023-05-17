import React, { FC } from "react";
import MineTailingsInfoTabs from "./MineTailingsInfoTabs";

export const MineReportTailingsInfo: FC = () => (
  <MineTailingsInfoTabs enabledTabs={["reports", "map"]} />
);

export default MineReportTailingsInfo;
