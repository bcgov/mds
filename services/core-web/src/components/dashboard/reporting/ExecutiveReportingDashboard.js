import React, { Component } from "react";
import { fetchMetabaseDashboard } from "@mds/common/redux/actionCreators/reportingActionCreator";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import { PageTracker } from "@common/utils/trackers";

export class ExecutiveReportingDashboard extends Component {
  state = {};

  async componentDidMount() {
    const dashboard_url = await fetchMetabaseDashboard("167");
    this.setState({ dashboard_url });
  }

  render() {
    const iframeUrl = `${this.state.dashboard_url}#bordered=true&titled=false`;
    return this.state.dashboard_url ? (
      <div>
        <PageTracker title="Executive Dashboard" />
        <h1>Executive Dashboard</h1>
        <iframe
          title="metabaseDashboard"
          src={iframeUrl}
          frameBorder="0"
          width="100%"
          height="2700px"
        />
      </div>
    ) : (
      <div>
        <h1>Executive Dashboard</h1>
      </div>
    );
  }
}
export default AuthorizationGuard(Permission.EXECUTIVE)(ExecutiveReportingDashboard);
