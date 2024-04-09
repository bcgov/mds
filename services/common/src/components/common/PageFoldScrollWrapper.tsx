import React, { FC, ReactNode, ReactNodeArray, useEffect, useState } from "react";

/**
  A wrapper to confine content to "above the page fold"
  - Puts a div with a Y-scroll around the children (div is given [optional] id param),
    math finds out how much space is above it, and max-height is set accordingly
  - Pass in an offsetBottom to keep content below of that height above page fold too,
    without making that content scroll.
  - To keep content from disappearing on small windows, use minHeight (or let it be default)
  - Watches for window resizes.
 */
const PageFoldScrollWrapper: FC<{
  children: ReactNode | ReactNodeArray;
  id?: string;
  minHeight?: number;
  offsetBottom?: number;
}> = ({ children, id = "page-fold-wrapper", minHeight = 100, offsetBottom = 0 }) => {
  const [maxHeight, setMaxHeight] = useState(minHeight);

  const setSize = () => {
    const windowHeight = window.innerHeight;
    const container = document.getElementById(id);
    const containerTopOffset = container?.getBoundingClientRect()?.top;
    const height = Math.max(windowHeight - containerTopOffset - offsetBottom, minHeight);
    setMaxHeight(height);
  };

  useEffect(() => {
    setSize();
    window.addEventListener("resize", setSize);
    return () => window.removeEventListener("resize", setSize);
  }, [offsetBottom]);

  return (
    <div
      id={id}
      style={{ maxHeight, overflowY: "scroll", minHeight }}
      className="page-scroll-wrapper"
    >
      {children}
    </div>
  );
};

export default PageFoldScrollWrapper;
