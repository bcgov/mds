import axios from "axios";
import {
  KEYCLOAK as K,
  ENVIRONMENT as E,
  DEFAULT_ENVIRONMENT as DE,
  MINE_COMPLIANCE_SUMMARY,
} from "@mds/common";
import { KEYCLOAK, ENVIRONMENT, DEFAULT_ENVIRONMENT } from "@common/constants/environment";

export default function fetchEnv() {
  console.log("APPLES");
  console.log("APPLES", MINE_COMPLIANCE_SUMMARY("vyas"));
  console.log("APPLES");
  console.log("APPLES", KEYCLOAK);
  console.log("APPLES", K);
  console.log("APPLES", DEFAULT_ENVIRONMENT);
  console.log("APPLES", DE);
  console.log("APPLES", ENVIRONMENT);
  console.log("APPLES", E);
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
      ENVIRONMENT.apiUrl = env.apiUrl;
      ENVIRONMENT.docManUrl = env.docManUrl;
      ENVIRONMENT.filesystemProviderUrl = env.filesystemProviderUrl;
      ENVIRONMENT.matomoUrl = env.matomoUrl;
      KEYCLOAK.clientId = env.keycloak_clientId;
      KEYCLOAK.resource = env.keycloak_resource;
      KEYCLOAK.url = env.keycloak_url;
      KEYCLOAK.idir_idpHint = env.keycloak_idir_idpHint;
      KEYCLOAK.bceid_idpHint = env.keycloak_bceid_idpHint;
      KEYCLOAK.vcauthn_idpHint = env.keycloak_vcauthn_idpHint;
      ENVIRONMENT.environment = env.environment;
    });
}
