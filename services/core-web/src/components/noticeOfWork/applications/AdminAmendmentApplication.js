import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { kebabCase, isEmpty } from "lodash";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import * as routes from "@/constants/routes";
import DraftPermitTab from "@/components/noticeOfWork/applications/permitGeneration/DraftPermitTab";
import ApplicationTab from "@/components/noticeOfWork/applications/review/ApplicationTab";
import ReferralTabs from "@/components/noticeOfWork/applications/referals/ReferralTabs";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfWorkPageHeader from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import AdministrativeTab from "@/components/noticeOfWork/applications/administrative/AdministrativeTab";
import ManageDocumentsTab from "@/components/noticeOfWork/applications/manageDocuments/ManageDocumentsTab";
import ProcessPermit from "@/components/noticeOfWork/applications/process/ProcessPermit";
import ApplicationGuard from "@/HOC/ApplicationGuard";
import { getDraftPermitForNOW } from "@mds/common/redux/selectors/permitSelectors";

/**
 * @class NoticeOfWorkApplication- contains all information regarding a CORE notice of work application
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
  renderTabTitle: PropTypes.func.isRequired,
  applicationPageFromRoute: CustomPropTypes.applicationPageFromRoute,
  draftPermit: CustomPropTypes.permit.isRequired,
};

const defaultProps = { applicationPageFromRoute: "" };

export class AdminAmendmentApplication extends Component {
  state = {
    isTabLoaded: false,
    activeTab: "application",
  };

  componentDidMount() {
    if (this.props.match.params.tab) {
      this.setActiveTab(this.props.match.params.tab);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.tab !== this.props.match.params.tab) {
      this.setState({ isTabLoaded: false });
      this.setActiveTab(nextProps.match.params.tab);
    }
  }

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab, isTabLoaded: true });
  };

  handleTabChange = (key) => {
    this.props.history.replace(
      routes.ADMIN_AMENDMENT_APPLICATION.dynamicRoute(
        this.props.noticeOfWork.now_application_guid,
        kebabCase(key)
      )
    );
  };

  render() {
    const isNoticeOfWorkTypeDisabled =
      (this.props.draftPermit && !isEmpty(this.props.draftPermit.permit_guid)) ||
      !["QIM", "QCA"].includes(this.props.noticeOfWork.notice_of_work_type_code);
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
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ApplicationTab
                fixedTop={this.props.fixedTop}
                isNoticeOfWorkTypeDisabled={isNoticeOfWorkTypeDisabled}
              />
            </LoadingWrapper>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={this.props.renderTabTitle("Referral", "REF")}
            key="referral"
            disabled={!this.props.noticeOfWork.lead_inspector_party_guid}
          >
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ReferralTabs
                mineGuid={this.props.noticeOfWork.mine_guid}
                noticeOfWork={this.props.noticeOfWork}
                type="REF"
                fixedTop={this.props.fixedTop}
              />
            </LoadingWrapper>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={this.props.renderTabTitle("Consultation", "CON")}
            key="consultation"
            disabled={!this.props.noticeOfWork.lead_inspector_party_guid}
          >
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ReferralTabs
                mineGuid={this.props.noticeOfWork.mine_guid}
                noticeOfWork={this.props.noticeOfWork}
                type="FNC"
                fixedTop={this.props.fixedTop}
              />
            </LoadingWrapper>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={this.props.renderTabTitle("Draft", "DFT")}
            key="draft-permit"
            disabled={!this.props.noticeOfWork.lead_inspector_party_guid}
          >
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <DraftPermitTab
                fixedTop={this.props.fixedTop}
                isNoticeOfWorkTypeDisabled={isNoticeOfWorkTypeDisabled}
              />
            </LoadingWrapper>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab="Process"
            key="process-permit"
            disabled={!this.props.noticeOfWork.lead_inspector_party_guid}
          >
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ProcessPermit
                mineGuid={this.props.noticeOfWork.mine_guid}
                noticeOfWork={this.props.noticeOfWork}
                fixedTop={this.props.fixedTop}
              />
            </LoadingWrapper>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab="Administrative"
            key="administrative"
            disabled={!this.props.noticeOfWork.lead_inspector_party_guid}
          >
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <AdministrativeTab fixedTop={this.props.fixedTop} />
            </LoadingWrapper>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab="Manage Documents"
            key="manage-documents"
            disabled={!this.props.noticeOfWork.lead_inspector_party_guid}
          >
            {this.props.noticeOfWork.lead_inspector_party_guid && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <ManageDocumentsTab fixedTop={this.props.fixedTop} />
              </LoadingWrapper>
            )}
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  mines: getMines(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  documentContextTemplate: getDocumentContextTemplate(state),
  draftPermit: getDraftPermitForNOW(state),
});

AdminAmendmentApplication.propTypes = propTypes;
AdminAmendmentApplication.defaultProps = defaultProps;

export default connect(mapStateToProps)(ApplicationGuard(AdminAmendmentApplication));
