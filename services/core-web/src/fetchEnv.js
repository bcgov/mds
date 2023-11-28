import axios from "axios";
import { setupEnvironment, setupKeycloak, DEFAULT_ENVIRONMENT } from "@mds/common";

export default function fetchEnv() {
  return axios
    .get(`${process.env.BASE_PATH}/env`)
    .then((res) => {
      try {
        JSON.stringify(res.data);
        return res.data;
      } catch (err) {
        return DEFAULT_ENVIRONMENT;
      }
    })
    .catch(() => DEFAULT_ENVIRONMENT)
    .then((env) => {
      setupEnvironment(
        env.apiUrl,
        env.docManUrl,
        env.filesystemProviderUrl,
        env.matomoUrl,
        env.environment,
        env.flagsmithKey,
        env.flagsmithUrl,
        env.errorNotifyRecipients
      );

      setupKeycloak(
        env.keycloak_clientId,
        env.keycloak_resource,
        env.keycloak_url,
        env.keycloak_idpHint,
        env.keycloak_bceid_idpHint || "na",
        env.keycloak_vcauthn_idpHint || "na",
        env.vcauthn_pres_req_conf_id || "na",
        env.siteminder_url || "na"
      );
    });
}
