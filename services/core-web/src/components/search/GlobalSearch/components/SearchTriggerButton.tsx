import React, { useState } from "react";
import { Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import classNames from "classnames";

interface SearchTriggerButtonProps {
  onClick: () => void;
  placeholder?: string;
  size?: "small" | "middle" | "large";
  enableShortcut?: boolean;
}

export const SearchTriggerButton: React.FC<SearchTriggerButtonProps> = ({
  onClick,
  placeholder = "Search Core...",
  size = "middle",
  enableShortcut = true
}) => {
  const [isFocussed, setIsFocussed] = useState(false);
  const platform: string = window.navigator.platform.toLowerCase();
  const isMac = platform.includes("mac");
  let buttonText = isMac ? "⌘ + K" : "CTRL + K";

  const suffix = enableShortcut ? (
    <Button className="search-bar-button">
      {buttonText}
    </Button>
  ) : null;

  return (
    <div className="search-trigger-container">
      <Input
        size={size}
        prefix={size === "middle" ? <SearchOutlined className="search-icon" /> : undefined}
        suffix={suffix || <SearchOutlined className="search-icon" />}
        placeholder={placeholder}
        className={classNames(
          "searchbar",
          isFocussed ? "search-focussed" : "search-not-focussed",
          size === "large" ? "searchbar-large" : ""
        )}
        readOnly
        onFocus={() => setIsFocussed(true)}
        onBlur={() => setIsFocussed(false)}
        onClick={onClick}
      />
    </div>
  );
};
