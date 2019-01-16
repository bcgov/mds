import React from "react";

export const SidebarBlock = ({ title, content, hasButton, buttonText }) => (
  <div className="sidebar-block">
    <div className="sidebar-block-title">
      <h2>{title}</h2>
    </div>
    <div className="sidebar-block-content">
      <p>{content}</p>
    </div>
  </div>
);

export default SidebarBlock(SidebarBlock);
