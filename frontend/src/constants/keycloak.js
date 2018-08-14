import { ENVIRONMENT } from './environment';

export const KEYCLOAK = {
  "realm": "mds",
  "url": "https://sso-test.pathfinder.gov.bc.ca/auth",
  "ssl-required": "external",
  "resource": ENVIRONMENT.resource,
  "public-client": true,
  "confidential-port": 0,
  "clientId": ENVIRONMENT.clientId
}