import React, { FC, ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ScrollSideMenu, { ScrollSideMenuProps } from "./ScrollSideMenu";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";

interface ScrollSidePageWrapperProps {
  content: ReactNode;
  menuProps: ScrollSideMenuProps;
  header: ReactNode;
  headerHeight?: number;
}

export const coreHeaderHeight = 62; // match scss variable $header-height
const msHeaderHeight = 80;

const ScrollSidePageWrapper: FC<ScrollSidePageWrapperProps> = ({
  menuProps,
  content,
  header,
  headerHeight = 170,
}) => {
  const [isFixedTop, setIsFixedTop] = useState(false);
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;

  const systemHeaderHeight = isCore ? coreHeaderHeight : msHeaderHeight;
  const contentPaddingY = isCore ? 24 : 26;

  const handleScroll = () => {
    let isMounted = true;
    if (isMounted) {
      const scrollHeight = window.scrollY ?? window.pageYOffset;
      if (scrollHeight > 0 && !isFixedTop) {
        setIsFixedTop(true);
        // oddly, isFixedTop never ends up being true here, even though it seems to take effect,
        // so took out isFixedTop is true out from condition
      } else if (scrollHeight <= 0) {
        setIsFixedTop(false);
      }
    }
    return () => (isMounted = false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }, []);

  const hasMenu = menuProps.menuOptions.length > 0;
  const hasHeader = Boolean(header);

  const contentClass = [hasMenu && "side-menu--content", isFixedTop && "with-fixed-top"]
    .filter(Boolean)
    .join(" ");
  const topOffset = headerHeight + systemHeaderHeight;

  const menuTopOffset = hasHeader || isFixedTop ? topOffset : 0;
  const contentTopOffset = hasHeader && isFixedTop ? headerHeight : 0;

  return (
    <div className="scroll-side-menu-wrapper">
      {hasHeader && (
        <div
          className={isFixedTop ? "view--header fixed-scroll" : "view--header"}
          style={{ paddingBottom: 0, height: headerHeight }}
        >
          {header}
        </div>
      )}
      {hasMenu && (
        <div
          className={isFixedTop ? "side-menu--fixed" : "side-menu"}
          style={{ top: menuTopOffset }}
        >
          {/* the 24 matches the margin/padding on the menu/content. Looks nicer */}
          <ScrollSideMenu offsetTop={topOffset + contentPaddingY} {...menuProps} />
        </div>
      )}
      <div className={contentClass} style={{ top: contentTopOffset }}>
        {content}
      </div>
    </div>
  );
};

export default ScrollSidePageWrapper;
