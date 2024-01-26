import React, { FC, ReactNode, useEffect, useState } from "react";
import ScrollSideMenu, { ScrollSideMenuProps } from "./ScrollSideMenu";

interface ScrollSidePageWrapperProps {
  content: ReactNode;
  menuProps: ScrollSideMenuProps;
  header: ReactNode;
  headerHeight?: number;
}

export const coreHeaderHeight = 64; // match scss variable $header-height

const ScrollSidePageWrapper: FC<ScrollSidePageWrapperProps> = ({
  menuProps,
  content,
  header,
  headerHeight = 170,
}) => {
  const [fixedTop, setIsFixedTop] = useState(false);
  const handleScroll = () => {
    const scrollHeight = window.scrollY ?? window.pageYOffset;
    if (scrollHeight > 0 && !fixedTop) {
      setIsFixedTop(true);
      // oddly, fixedTop never ends up being true here, even though it seems to take effect,
      // so took it fixedTop is true out from condition
    } else if (scrollHeight <= 0) {
      setIsFixedTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }, []);

  return (
    <div className="scroll-side-menu-wrapper">
      <div
        className={fixedTop ? "view--header fixed-scroll" : "view--header"}
        style={{ paddingBottom: 0, height: headerHeight }}
      >
        {header}
      </div>
      <div
        className={fixedTop ? "side-menu--fixed" : "side-menu"}
        style={{ top: headerHeight + coreHeaderHeight }}
      >
        {/* the 15 matches the margin/padding on the menu/content. Looks nicer */}
        <ScrollSideMenu offsetTop={headerHeight + coreHeaderHeight + 15} {...menuProps} />
      </div>
      <div
        className={fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"}
        style={fixedTop ? { top: headerHeight } : {}}
      >
        {content}
      </div>
    </div>
  );
};

export default ScrollSidePageWrapper;
