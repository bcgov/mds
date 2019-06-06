import React, { Component } from "react";
import jwt from "jsonwebtoken";

const { METABASE_SITE_URL = "", METABASE_SECRET_KEY = "" } = process.env;

const payload = {
  resource: { dashboard: 136 },
  params: {},
};

export class ReportingDashboard extends Component {
  state = {
    token: jwt.sign(payload, METABASE_SECRET_KEY),
  };

  render() {
    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${
      this.state.token
    }#bordered=true&titled=false`;
    return (
      <iframe
        title="metabaseDashboard"
        src={iframeUrl}
        frameBorder="0"
        width="100%"
        height="2700px"
        allowTransparency
      />
    );
  }
}

export default ReportingDashboard;
