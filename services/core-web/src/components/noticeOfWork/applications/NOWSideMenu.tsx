import React, { FC, useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { isEmpty } from "lodash";
import { Anchor } from "antd";
import * as routes from "@/constants/routes";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { renderActivities, sideMenuOptions } from "@/constants/NOWConditions";
import { getDraftPermitAmendmentForNOW } from "@mds/common/redux/selectors/permitSelectors";
import { useAppSelector } from "@mds/common/redux/rootState";
import { IPermitAmendment } from "@mds/common/interfaces";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";

/**
 * @constant NOWSideMenu renders react children with an active indicator if the id is in the url.
 */

interface NOWSideMenuProps {
  tabSection: string;
}

export const NOWSideMenu: FC<NOWSideMenuProps> = ({
  tabSection,
}) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const [showNested, setShowNested] = useState(false);
  const [urlRoute, setUrlRoute] = useState<string>();
  const location = useLocation();
  const history = useHistory();
  const params = useParams<{ id: string, tab: string }>();
  const noticeOfWork = useAppSelector(getNoticeOfWork)
  const draftPermitAmendment = useAppSelector(getDraftPermitAmendmentForNOW) as IPermitAmendment;

  // default to true, as the preferred flow has permit conditions.
  const hasPermitConditionsFlow = !isEmpty(draftPermitAmendment)
    ? draftPermitAmendment.has_permit_conditions
    : true;

  const updateUrlRoute = (route: string) => {
    const nowGuid = params.id;
    const nowRoute = noticeOfWork.is_historic
      ? routes.VIEW_NOTICE_OF_WORK_APPLICATION
      : routes.NOTICE_OF_WORK_APPLICATION;
    const applicationRoute =
      noticeOfWork.application_type_code === "NOW"
        ? nowRoute
        : routes.ADMIN_AMENDMENT_APPLICATION;
    setUrlRoute(applicationRoute.hashRoute(nowGuid, tabSection, route));

    if (route === history.location.hash) {
      return;
    }

    history.push(urlRoute, { currentActiveLink: route });
  };

  const handleAnchorOnClick = (e, link) => {
    e.preventDefault();
    handleNested(link.href.substring(1));
    updateUrlRoute(link.href);
  };

  useEffect(() => {
    // If the user loads the page with a hash in the URL, start them off at the corresponding NoW section.
    // Note: Because Keycloak authorization adds params to the URL when it redirects, props.location.hash
    // will be contaminated with extra params that we don't need. All we want is the hash that corresponds
    // to the NoW section, so we must parse it out. If the hash is "#state", we must ignore it (see example).
    // For example: #blasting&state=bd74ea1c-09e5-4d7e-810f-d3558969293a&session_state=1c577088-15a8-4ae2-...
    let link = location?.hash?.startsWith("#state") && location.hash;
    if (link) {
      if (link.includes('&')) {
        link = link.substr(0, link.indexOf("&"));
      }
      updateUrlRoute(link);
      document.querySelector(link)?.scrollIntoView()
    }
  }, []);

  const handleAnchorOnChange = (currentActiveLink) => {
    handleNested(currentActiveLink.substring(1));
    if (
      (history.action === "POP" &&
        currentActiveLink === location.hash) ||
      params.tab !== tabSection
    ) {
      return;
    }

    history.replace(urlRoute, { currentActiveLink });
  };

  const handleNested = (link) => {
    // gets the children if they exist
    const getChildren = sideMenuOptions(tabSection).filter(
      ({ children }) => children?.length > 0
    )[0]?.children;
    // checks if child href matches what was clicked
    const values = getChildren?.filter(({ href }) => link === href);
    // checks if children exist
    const obj = sideMenuOptions(tabSection).filter(({ href }) => link === href)[0];
    const show = obj?.children?.length > 0 || values?.length > 0;
    setShowNested(show);
  };

  return (
    <div>
      <Anchor
        affix={false}
        offsetTop={160}
        onChange={handleAnchorOnChange}
        onClick={handleAnchorOnClick}
      >
        {sideMenuOptions(tabSection, hasPermitConditionsFlow)
          .filter(
            ({ href, alwaysVisible, applicationType, featureFlag }) =>
              (alwaysVisible ||
                renderActivities(noticeOfWork.notice_of_work_type_code, href)) &&
              applicationType &&
              applicationType.includes(noticeOfWork.application_type_code) &&
              (!featureFlag || isFeatureEnabled(Feature[featureFlag]))
          )
          .map(({ href, title, children }) => (
            <Anchor.Link href={`#${href}`} title={title} className="now-menu-link" key={href}>
              {children &&
                children.length > 1 &&
                showNested &&
                children.map((child) => (
                  <Anchor.Link
                    href={`#${child.href}`}
                    title={child.title}
                    className="now-menu-link"
                  />
                ))}
            </Anchor.Link>
          ))}
      </Anchor>
    </div>
  );
};

export default NOWSideMenu;