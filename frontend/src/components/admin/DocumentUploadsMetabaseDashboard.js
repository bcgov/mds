import React, { Component } from "react";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";

/**
 * @class DocumentUploadsMetabaseDashboard displays an iframe housing Document Upload information.
 */

const jwt = require("jsonwebtoken");

const METABASE_SITE_URL = "https://mds-metabase-empr-mds-prod.pathfinder.gov.bc.ca";
const METABASE_SECRET_KEY = "623e8cbb9f381e40651494194032c005ba8e92559ba291a8587d1b8e021cb454";

const payload = {
  resource: { dashboard: 1 },
  params: {}
};
const token = jwt.sign(payload, METABASE_SECRET_KEY);

export class DocumentUploadsMetabaseDashboard extends Component{
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
    return (
      <iframe title="metabaseDashboard" src={iframeUrl} frameBorder="0" width="100%" height="2700px" allowTransparency/>
    );
  }
}

export default AuthorizationGuard(Permission.ADMIN)(DocumentUploadsMetabaseDashboard);