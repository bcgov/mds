import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import ApplicationTab from "@/components/noticeOfWork/applications/review/ApplicationTab";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfWorkPageHeader from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import ApplicationGuard from "@/HOC/ApplicationGuard";

/**
 * @class ViewNoticeOfWorkApplication- contains the application tab to view a notice of work application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
  }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fixedTop: PropTypes.bool.isRequired,
  applicationPageFromRoute: CustomPropTypes.applicationPageFromRoute,
};

const defaultProps = { applicationPageFromRoute: "" };

export class ViewNoticeOfWorkApplication extends Component {
  state = {
    activeTab: "application",
  };

  render() {
    return (
      <div className="page">
        <NoticeOfWorkPageHeader
          noticeOfWork={this.props.noticeOfWork}
          applicationPageFromRoute={this.props.applicationPageFromRoute}
          fixedTop={this.props.fixedTop}
        />
        <Tabs
          size="large"
          activeKey={this.state.activeTab}
          animated={{ inkBar: true, tabPane: false }}
          className="now-tabs"
          style={{ margin: "0" }}
          centered
        >
          <Tabs.TabPane tab="Application" key="application">
            <ApplicationTab fixedTop={this.props.fixedTop} showActionsAndProgress={false} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
});

ViewNoticeOfWorkApplication.propTypes = propTypes;
ViewNoticeOfWorkApplication.defaultProps = defaultProps;

export default connect(mapStateToProps, null)(ApplicationGuard(ViewNoticeOfWorkApplication));
