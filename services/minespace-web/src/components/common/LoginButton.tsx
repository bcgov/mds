import { Button } from "antd";
import React, { FC } from "react";
import { useKeycloak } from "@react-keycloak/web";
import * as MINESPACE_ENV from "@/constants/environment";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";

const CHES_FORM_URL =
  "https://submit.digital.gov.bc.ca/app/form/submit?f=0cdcf6c4-bbad-429e-b17b-4031d8960ae3";

interface LoginButtonProps {
  isNewUser?: boolean;
}

const LoginButton: FC<LoginButtonProps> = ({ isNewUser = false }) => {
  const buttonText = isNewUser ? "Join MineSpace" : "Log in with BCeID";
  const { keycloak } = useKeycloak();
  const { isFeatureEnabled } = useFeatureFlag();
  const isNewSignUp = isFeatureEnabled(Feature.MINESPACE_SIGNUP);

  const kcLogin = () => {
    keycloak
      .login({
        idpHint: "bceidboth",
        redirectUri: MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI,
      })
      .then(() => {});
  };

  // open link to CHES form if the new feature is disabled and "join MS" scenario
  // else login to kc
  const linkProps =
    isNewUser && !isNewSignUp
      ? {
          href: CHES_FORM_URL,
          target: "_blank",
        }
      : {
          onClick: kcLogin,
        };

  return (
    <Button {...linkProps} size="large" className="login" type={isNewUser ? "default" : "primary"}>
      {buttonText}
    </Button>
  );
};

export default LoginButton;
