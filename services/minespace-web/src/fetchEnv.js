import axios from "axios";
import { setupEnvironment, setupKeycloak } from "@mds/common";
import { DEFAULT_ENVIRONMENT } from "@/constants/environment";

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
        env.syncfusionLicense
      );

      setupKeycloak(
        env.keycloak_clientId,
        env.keycloak_resource,
        env.keycloak_url,
        env.keycloak_idir_idpHint,
        env.keycloak_bceid_idpHint,
        env.keycloak_vcauthn_idpHint,
        env.vcauthn_pres_req_conf_id,
        env.siteminder_url
      );
    });
}
