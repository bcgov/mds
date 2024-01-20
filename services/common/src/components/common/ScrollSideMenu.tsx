import React, { FC, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Anchor } from "antd";
import { ISideMenuOption } from "../../interfaces/common/sideMenuOption.interface";

/**
 * @constant ScrollSideMenu renders react children with an active indicator if the id is in the url.
 */

interface ScrollSideMenuProps {
  menuOptions: ISideMenuOption[];
  featureUrlRoute: any;
  featureUrlRouteArguments: (string | number)[];
  history: any;
  location: any;
  match: any;
  tabSection?: string;
}

export const ScrollSideMenu: FC<ScrollSideMenuProps> = ({ tabSection = "", ...props }) => {
  let urlRoute = undefined;

  const updateUrlRoute = (route) => {
    urlRoute = props.featureUrlRoute(...props.featureUrlRouteArguments, route);
    if (route === props.history.location.hash) {
      return;
    }

    props.history.push(urlRoute, { currentActiveLink: route });
  };

  useEffect(() => {
    // If the user loads the page with a hash in the URL, start them off at the corresponding feature section.
    // Note: Because Keycloak authorization adds params to the URL when it redirects, props.location.hash
    // will be contaminated with extra params that we don't need. All we want is the hash that corresponds
    // to the feature section, so we must parse it out. If the hash is "#state", we must ignore it (see example).
    // For example: #blasting&state=bd74ea1c-09e5-4d7e-810f-d3558969293a&session_state=1c577088-15a8-4ae2-...
    let link =
      props.location && props.location.hash && !props.location.hash.startsWith("#state")
        ? props.location.hash
        : undefined;
    if (!link) {
      return;
    }

    // Extracts "#blasting" from "#blasting&state=bd74ea1c-09e5-4d7e-810f-d...", for example.
    if (link.includes("&")) {
      link = link.substr(0, link.indexOf("&"));
    }

    updateUrlRoute(link);
    document.querySelector(link)?.scrollIntoView();
  }, []);

  const handleAnchorOnClick = (e, link) => {
    e.preventDefault();
    updateUrlRoute(link.href);
  };

  const handleAnchorOnChange = (currentActiveLink) => {
    if (
      (props.history.action === "POP" && currentActiveLink === props.history.location.hash) ||
      props.match.params.tab !== tabSection
    ) {
      return;
    }

    props.history.replace(urlRoute, { currentActiveLink });
  };

  return (
    <div>
      <Anchor
        affix={false}
        offsetTop={160}
        onChange={handleAnchorOnChange}
        onClick={handleAnchorOnClick}
      >
        {props.menuOptions.map(({ href, title, icon }) => {
          const titleElement = (
            <div className="ellipsis-text">
              {icon && <span className="margin-medium--right">{icon}</span>}
              {title}
            </div>
          );
          return (
            <Anchor.Link
              key={title}
              href={`#${href}`}
              title={titleElement}
              className="now-menu-link"
            />
          );
        })}
      </Anchor>
    </div>
  );
};

export default withRouter(ScrollSideMenu);
