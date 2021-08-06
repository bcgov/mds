import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import { kebabCase, isEmpty } from "lodash";
import { bindActionCreators } from "redux";
import {
  fetchImportedNoticeOfWorkApplication,
  importNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { connect } from "react-redux";
import { getNoticeOfWork, getOriginalNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import { getMines } from "@common/selectors/mineSelectors";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@common/selectors/staticContentSelectors";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import * as routes from "@/constants/routes";
import ApplicationTab from "@/components/noticeOfWork/applications/review/ApplicationTab";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfWorkPageHeader from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ApplicationGuard from "@/HOC/ApplicationGuard";
import { getDraftPermitForNOW } from "@common/selectors/permitSelectors";
import ManageDocumentsTab from "@/components/noticeOfWork/applications/manageDocuments/ManageDocumentsTab";

/**
 * @class NoticeOfWorkApplication- contains all tabs needed for a CORE notice of work application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
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
  renderTabTitle: PropTypes.func.isRequired,
  applicationPageFromRoute: CustomPropTypes.applicationPageFromRoute,
  mineGuid: PropTypes.string.isRequired,
  draftPermit: CustomPropTypes.permit.isRequired,
};

const defaultProps = { applicationPageFromRoute: "" };

export class HistoricNoticeOfWorkApplication extends Component {
  state = {
    isTabLoaded: false,
    activeTab: "application",
  };

  componentDidMount() {
    if (!this.props.noticeOfWork.imported_to_core) {
      console.log(this.props.noticeOfWork);
      // this.handleNOWImport();
    }
    if (
      this.props.noticeOfWork.imported_to_core &&
      this.props.match.params.tab === "verification"
    ) {
      this.handleTabChange("application");
    }

    if (this.props.match.params.tab) {
      this.setActiveTab(this.props.match.params.tab);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.tab !== this.props.match.params.tab) {
      this.setState({ isTabLoaded: false });
      this.setActiveTab(nextProps.match.params.tab);
    }
    if (nextProps.noticeOfWork.imported_to_core !== this.props.noticeOfWork.imported_to_core) {
      this.handleTabChange("application");
    }
  }

  handleNOWImport = () => {
    return this.props
      .importNoticeOfWorkApplication(
        this.props.noticeOfWork.now_application_guid,
        this.props.noticeOfWork
      )
      .then(() =>
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        )
      )
      .finally(() => {
        this.setState({ isImporting: false });
      });
  };

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab, isTabLoaded: true });
  };

  handleTabChange = (key) => {
    this.props.history.replace(
      routes.HISTORIC_NOTICE_OF_WORK_APPLICATION.dynamicRoute(
        this.props.noticeOfWork.now_application_guid,
        kebabCase(key)
      )
    );
  };

  render() {
    const isImported = this.props.noticeOfWork.imported_to_core;

    const isNoticeOfWorkTypeDisabled =
      (this.props.draftPermit && !isEmpty(this.props.draftPermit.permit_guid)) ||
      !["SAG", "QIM", "QCA"].includes(this.props.noticeOfWork.notice_of_work_type_code);

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
          onTabClick={this.handleTabChange}
          style={{ margin: "0" }}
          centered
        >
          <Tabs.TabPane tab="Application" key="application">
            {/* {isImported && ( */}
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ApplicationTab
                fixedTop={this.props.fixedTop}
                isNoticeOfWorkTypeDisabled={isNoticeOfWorkTypeDisabled}
              />
            </LoadingWrapper>
            {/* )} */}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Manage Documents" key="manage-documents">
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ManageDocumentsTab fixedTop={this.props.fixedTop} />
            </LoadingWrapper>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchImportedNoticeOfWorkApplication,
      importNoticeOfWorkApplication,
    },
    dispatch
  );

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  originalNoticeOfWork: getOriginalNoticeOfWork(state),
  mines: getMines(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  documentContextTemplate: getDocumentContextTemplate(state),
  draftPermit: getDraftPermitForNOW(state),
});

HistoricNoticeOfWorkApplication.propTypes = propTypes;
HistoricNoticeOfWorkApplication.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationGuard(HistoricNoticeOfWorkApplication));
