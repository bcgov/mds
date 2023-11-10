import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { kebabCase, isEmpty } from "lodash";
import { getNoticeOfWork, getOriginalNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import * as routes from "@/constants/routes";
import DraftPermitTab from "@/components/noticeOfWork/applications/permitGeneration/DraftPermitTab";
import VerificationTab from "@/components/noticeOfWork/applications/verification/VerificationTab";
import ApplicationTab from "@/components/noticeOfWork/applications/review/ApplicationTab";
import ReferralTabs from "@/components/noticeOfWork/applications/referals/ReferralTabs";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfWorkPageHeader from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import AdministrativeTab from "@/components/noticeOfWork/applications/administrative/AdministrativeTab";
import ProcessPermit from "@/components/noticeOfWork/applications/process/ProcessPermit";
import ApplicationGuard from "@/HOC/ApplicationGuard";
import { getDraftPermitForNOW } from "@mds/common/redux/selectors/permitSelectors";
import ManageDocumentsTab from "@/components/noticeOfWork/applications/manageDocuments/ManageDocumentsTab";

import { INoticeOfWorkApplication } from "@mds/common";
import { INoticeOfWork } from "@mds/common";
import { INoticeOfWorkDraftPermit } from "@mds/common";

/**
 * @class NoticeOfWorkApplication- contains all tabs needed for a CORE notice of work application.
 */

interface NowApplicationState {
  isTabLoaded: boolean;
  activeTab: string;
  initialPermitGuid: string;
}

export class NoticeOfWorkApplication extends Component<
  INoticeOfWorkApplication,
  NowApplicationState,
  INoticeOfWorkDraftPermit
> {
  state = {
    isTabLoaded: false,
    activeTab: "verification",
    initialPermitGuid: "",
  };

  componentDidMount() {
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

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab, isTabLoaded: true });
  };

  handleTabChange = (key) => {
    this.props.history.replace(
      routes.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
        this.props.noticeOfWork.now_application_guid,
        kebabCase(key)
      )
    );
  };

  render() {
    const isImported = this.props.noticeOfWork.imported_to_core;
    const verificationComplete = isImported && this.props.noticeOfWork.lead_inspector_party_guid;

    const constructedProps = {
      isNoticeOfWorkTypeDisabled:
        (this.props.draftPermit && !isEmpty(this.props.draftPermit.permit_guid)) ||
        !["SAG", "QIM", "QCA"].includes(this.props.noticeOfWork.notice_of_work_type_code),
      fixedTop: this.props.fixedTop,
    };

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
          {!isImported && (
            <Tabs.TabPane tab="Verification" key="verification">
              <VerificationTab
                noticeOfWork={this.props.noticeOfWork}
                mineGuid={this.props.mineGuid}
                initialPermitGuid={this.state.initialPermitGuid}
                originalNoticeOfWork={this.props.originalNoticeOfWork}
              />
            </Tabs.TabPane>
          )}

          <Tabs.TabPane
            tab={this.props.renderTabTitle("Application", "REV")}
            key="application"
            disabled={!isImported}
          >
            {isImported && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <ApplicationTab {...constructedProps} />
              </LoadingWrapper>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={this.props.renderTabTitle("Referral", "REF")}
            key="referral"
            disabled={!verificationComplete}
          >
            {verificationComplete && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <ReferralTabs
                  mineGuid={this.props.noticeOfWork.mine_guid}
                  noticeOfWork={this.props.noticeOfWork}
                  type="REF"
                  fixedTop={this.props.fixedTop}
                />
              </LoadingWrapper>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={this.props.renderTabTitle("Consultation", "CON")}
            key="consultation"
            disabled={!verificationComplete}
          >
            {verificationComplete && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <ReferralTabs
                  mineGuid={this.props.noticeOfWork.mine_guid}
                  noticeOfWork={this.props.noticeOfWork}
                  type="FNC"
                  fixedTop={this.props.fixedTop}
                />
              </LoadingWrapper>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={this.props.renderTabTitle("Public Comment", "PUB")}
            key="public-comment"
            disabled={!verificationComplete}
          >
            {verificationComplete && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <ReferralTabs
                  mineGuid={this.props.noticeOfWork.mine_guid}
                  type="PUB"
                  fixedTop={this.props.fixedTop}
                />
              </LoadingWrapper>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={this.props.renderTabTitle("Draft", "DFT")}
            key="draft-permit"
            disabled={!verificationComplete}
          >
            {verificationComplete && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <DraftPermitTab {...constructedProps} />
              </LoadingWrapper>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Process" key="process-permit" disabled={!verificationComplete}>
            {verificationComplete && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <ProcessPermit
                  mineGuid={this.props.noticeOfWork.mine_guid}
                  noticeOfWork={this.props.noticeOfWork}
                  fixedTop={this.props.fixedTop}
                />
              </LoadingWrapper>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Administrative" key="administrative" disabled={!verificationComplete}>
            {verificationComplete && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <AdministrativeTab fixedTop={this.props.fixedTop} />
              </LoadingWrapper>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab="Manage Documents"
            key="manage-documents"
            disabled={!verificationComplete}
          >
            {verificationComplete && (
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
  originalNoticeOfWork: getOriginalNoticeOfWork(state),
  mines: getMines(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  documentContextTemplate: getDocumentContextTemplate(state),
  draftPermit: getDraftPermitForNOW(state),
});

export default connect(mapStateToProps)(ApplicationGuard(NoticeOfWorkApplication));
