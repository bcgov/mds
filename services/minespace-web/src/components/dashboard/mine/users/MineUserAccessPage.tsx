import React, { FC, useContext } from "react";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { IMine } from "@mds/common/interfaces";
import MineUserAccess from "@mds/common/components/mine/MineUserAccess";

const MineUserAccessPage: FC = () => {
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  return <MineUserAccess mineGuid={mine.mine_guid} />;
};

export default MineUserAccessPage;
