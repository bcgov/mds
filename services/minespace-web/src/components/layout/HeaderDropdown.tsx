import React, { FC } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Button } from "antd";
import MediaQuery from "react-responsive";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import { KEYCLOAK } from "@mds/common/constants/environment";
import { useAppSelector } from "@mds/common/redux/rootState";
import { ActionMenuButton, IHeaderAction } from "@mds/common/components/common/ActionMenu";
import { useKeycloak } from "@react-keycloak/web";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";

import * as route from "@/constants/routes";
import * as MINESPACE_ENV from "@/constants/environment";
import { signOutFromSSO } from "@/utils/authenticationHelpers";
import {
  isAuthenticated,
  getUserInfo,
  isProponent,
} from "@mds/common/redux/selectors/authenticationSelectors";
import AuthorizationWrapper from "../common/wrappers/AuthorizationWrapper";

const CHES_FORM_URL =
  "https://submit.digital.gov.bc.ca/app/form/submit?f=0cdcf6c4-bbad-429e-b17b-4031d8960ae3";

/**
 * HeaderDropdown contains various authentication states, and available links for authenticated users.
 * MediaQueries are used to switch the menu to a hamburger menu when viewed on mobile.
 */

const SMALLEST_DESKTOP_WIDTH = 1280;

const HeaderDropdown: FC = () => {
  const location = useLocation();
  const history = useHistory();
  const userInfo = useAppSelector(getUserInfo);
  const authenticated = useAppSelector(isAuthenticated);
  const isUserProponent = useAppSelector(isProponent);
  const { keycloak } = useKeycloak();
  const { isFeatureEnabled } = useFeatureFlag();
  const isNewSignUp = isFeatureEnabled(Feature.MINESPACE_SIGNUP);

  const handleLogout = () => {
    signOutFromSSO();
  };

  const handleLogin = () => {
    keycloak.login({
      idpHint: "bceidboth",
      redirectUri: MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI,
    });
  };

  const setActiveLink = (pathname: string) => {
    return location.pathname === pathname ? "header-link active" : "header-link";
  };

  const logoutAction: IHeaderAction = {
    key: "logout",
    label: "Log out",
    clickFunction: handleLogout,
  };

  const minesAction: IHeaderAction = {
    key: "mines",
    label: "My Mines",
    clickFunction: () => {
      history.push(route.MINES.route);
    },
  };

  const loginAction: IHeaderAction = {
    key: "login",
    label: "Log in with BCeID",
    clickFunction: handleLogin,
  };

  const joinAction: IHeaderAction = isNewSignUp
    ? {
        key: "join",
        label: "Join MineSpace",
        clickFunction: handleLogin,
      }
    : {
        key: "join",
        label: (
          <a
            href={CHES_FORM_URL}
            target="_blank"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Join MineSpace
          </a>
        ),
        clickFunction: () => {},
      };

  const unauthenticatedActions: IHeaderAction[] = [loginAction, joinAction];

  const desktopActions: IHeaderAction[] = authenticated ? [logoutAction] : unauthenticatedActions;

  const mobileActions: IHeaderAction[] = [
    ...(isUserProponent ? [minesAction] : []),
    ...(authenticated ? [logoutAction] : unauthenticatedActions),
  ];

  const buttonText = authenticated ? userInfo.email : "Menu";

  return (
    <span>
      <MediaQuery minWidth={SMALLEST_DESKTOP_WIDTH}>
        {authenticated && (
          <AuthorizationWrapper>
            <Link to={route.MINES.route} className={setActiveLink(route.MINES.route)}>
              My Mines
            </Link>
          </AuthorizationWrapper>
        )}
        <ActionMenuButton
          actions={desktopActions}
          buttonText={buttonText}
          dropdownIcon={<MenuOutlined />}
          buttonProps={{
            type: "default",
            ghost: true,
            size: "middle",
            className: "header-dropdown-button",
          }}
        />
      </MediaQuery>
      <MediaQuery maxWidth={SMALLEST_DESKTOP_WIDTH - 1}>
        <ActionMenuButton
          actions={mobileActions}
          buttonText="Menu"
          dropdownIcon={<MenuOutlined />}
          buttonProps={{
            type: "default",
            ghost: true,
            size: "middle",
            id: "dropdown-menu-mobile-trigger",
            className: "header-dropdown-button",
          }}
        />
      </MediaQuery>
      {!authenticated && (
        <AuthorizationWrapper inTesting>
          <Button className="login-btn">
            <a
              href={`${KEYCLOAK.loginURL}${MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${KEYCLOAK.vcauthn_idpHint}`}
            >
              Log in with Verifiable Credentials
            </a>
          </Button>
        </AuthorizationWrapper>
      )}
    </span>
  );
};

export default HeaderDropdown;
