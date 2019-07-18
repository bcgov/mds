import React, { Component } from "react";
import { fetchLandingPageDashboard } from "@/actionCreators/reportingActionCreator";

export class ReportingDashboard extends Component {
  state = {};

  async componentDidMount() {
    const dashboard_url = await fetchLandingPageDashboard("136");
    this.setState({ dashboard_url });
  }

  render() {
    const iframeUrl = `${this.state.dashboard_url}#bordered=true&titled=false`;
    return this.state.dashboard_url ? (
      <iframe
        title="metabaseDashboard"
        src={iframeUrl}
        frameBorder="0"
        width="100%"
        height="2700px"
        allowTransparency
      />
    ) : (
      <div />
    );
  }
}

export default ReportingDashboard;
