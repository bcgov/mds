import React, { FC } from "react";
import MineTailingsInfoTabs from "@/components/mine/Tailings/MineTailingsInfoTabs";

export const MineTailingsDetailsPage: FC = () => (
  <MineTailingsInfoTabs enabledTabs={["tsfDetails"]} />
);

export default MineTailingsDetailsPage;
