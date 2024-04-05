import React, { FC, ReactNode, ReactNodeArray, useLayoutEffect, useEffect, useState } from "react";

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
    <div id={id} style={{ maxHeight, overflowY: "scroll", minHeight }}>
      {children}
    </div>
  );
};

export default PageFoldScrollWrapper;
