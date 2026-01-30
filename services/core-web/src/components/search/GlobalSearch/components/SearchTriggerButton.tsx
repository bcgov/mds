import React, { useState } from "react";
import { Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import classNames from "classnames";

interface SearchTriggerButtonProps {
  onClick: () => void;
  placeholder?: string;
}

export const SearchTriggerButton: React.FC<SearchTriggerButtonProps> = ({ 
  onClick, 
  placeholder = "Search Core..." 
}) => {
  const [isFocussed, setIsFocussed] = useState(false);
  const platform: string = window.navigator.platform.toLowerCase();
  const isMac = platform.includes("mac");
  let buttonText = isMac ? "⌘ + K" : "CTRL + K";

  const suffix = (
    <Button className="search-bar-button">
      {buttonText}
    </Button>
  );

  return (
    <div className="search-trigger-container" onClick={onClick}>
      <Input
        prefix={<SearchOutlined className="search-icon" />}
        suffix={suffix}
        placeholder={placeholder}
        className={classNames("searchbar", isFocussed ? "search-focussed" : "search-not-focussed")}
        readOnly
        onFocus={() => setIsFocussed(true)}
        onBlur={() => setIsFocussed(false)}
      />
    </div>
  );
};
