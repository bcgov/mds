import React from "react";
import { Button, Tag } from "antd";

import { BC_GOV } from "@/constants/assets";
import { AuthenticationGuard } from "../HOC/AuthenticationGuard";

export const Header = () => (
  <div className="header">
    <img alt="bc_gov_logo" src={BC_GOV} />
    <h1 className="header-h1">
      <span className="header-title-bc">BC</span>
      <span className="header-title"> MineSpace</span>
    </h1>
    <Button type="primary" ghost>
      Log in
    </Button>
    <Tag>Hello</Tag>
  </div>
);

export default AuthenticationGuard(Header);
