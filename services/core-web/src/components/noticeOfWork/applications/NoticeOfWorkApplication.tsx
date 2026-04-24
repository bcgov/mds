import React, { FC, useState, useEffect } from "react";
import { Tabs } from "antd";
import { useAppSelector } from "@mds/common/redux/rootState";
import { useParams, useHistory } from "react-router-dom";
import { kebabCase, isEmpty } from "lodash";
import { getNoticeOfWork, getOriginalNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import * as routes from "@/constants/routes";
import DraftPermitTab from "@/components/noticeOfWork/applications/permitGeneration/DraftPermitTab";
import VerificationTab from "@/components/noticeOfWork/applications/verification/VerificationTab";
import ApplicationTab from "@/components/noticeOfWork/applications/review/ApplicationTab";
import ReferralTabs from "@/components/noticeOfWork/applications/referals/ReferralTabs";
import NoticeOfWorkPageHeader from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import AdministrativeTab from "@/components/noticeOfWork/applications/administrative/AdministrativeTab";
import ProcessPermit from "@/components/noticeOfWork/applications/process/ProcessPermit";
import ApplicationGuard from "@/HOC/ApplicationGuard";
import { getDraftPermitForNOW } from "@mds/common/redux/selectors/permitSelectors";
import ManageDocumentsTab from "@/components/noticeOfWork/applications/manageDocuments/ManageDocumentsTab";
import { IPermit } from "@mds/common/interfaces";
import NowApplicationDocumentSearchForm from "@/components/noticeOfWork/applications/search/NowApplicationDocumentSearch";

/**
 * NoticeOfWorkApplication - contains all tabs needed for a CORE notice of work application.
 */

interface NoticeOfWorkApplicationProps {
  mineGuid: string;
  fixedTop: boolean;
  applicationPageFromRoute: { route: string; title: string };
  renderTabTitle: (title: string, badgeCode: string) => React.ReactNode;
}

export const NoticeOfWorkApplication: FC<NoticeOfWorkApplicationProps> = (props) => {
  const [isTabLoaded, setIsTabLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("verification");
  const { tab } = useParams<{ tab: string }>();
  const history = useHistory();

  const noticeOfWork = useAppSelector(getNoticeOfWork);
  const originalNoticeOfWork = useAppSelector(getOriginalNoticeOfWork);
  const draftPermit: Partial<IPermit> = useAppSelector(getDraftPermitForNOW);

  const setActiveTabState = (tab: string) => {
    setActiveTab(tab);
    setIsTabLoaded(true);
  };

  const handleTabChange = (key: string) => {
    history.replace(
      routes.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
        noticeOfWork.now_application_guid,
        kebabCase(key)
      )
    );
  };

  useEffect(() => {
    if (
      noticeOfWork.imported_to_core &&
      tab === "verification"
    ) {
      handleTabChange("application");
    }

    if (tab) {
      setActiveTabState(tab);
    }
  }, []);

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setIsTabLoaded(false);
      setActiveTabState(tab);
    }
  }, [tab]);

  useEffect(() => {
    // Equivalent to the previous componentWillReceiveProps check for imported_to_core
    if (noticeOfWork.imported_to_core) {
      handleTabChange("application");
    }
  }, [noticeOfWork.imported_to_core]);

  const isImported = noticeOfWork.imported_to_core;
  const verificationComplete = isImported && noticeOfWork.lead_inspector_party_guid;

  const constructedProps = {
    isNoticeOfWorkTypeDisabled:
      (draftPermit && !isEmpty(draftPermit.permit_guid)) ||
      !["SAG", "QIM", "QCA"].includes(noticeOfWork.notice_of_work_type_code),
    fixedTop: props.fixedTop,
  };

  return (
    <div className="page">
      <NoticeOfWorkPageHeader
        noticeOfWork={noticeOfWork}
        applicationPageFromRoute={props.applicationPageFromRoute}
        fixedTop={props.fixedTop}
      />
      <Tabs
        size="large"
        activeKey={activeTab}
        animated={{ inkBar: true, tabPane: false }}
        className="now-tabs"
        onChange={handleTabChange}
        style={{ margin: "0" }}
        centered
      >
        {!isImported && (
          <Tabs.TabPane tab="Verification" key="verification">
            <VerificationTab
              noticeOfWork={noticeOfWork}
              mineGuid={props.mineGuid}
              originalNoticeOfWork={originalNoticeOfWork}
            />
          </Tabs.TabPane>
        )}

        <Tabs.TabPane
          tab={props.renderTabTitle("Application", "REV")}
          key="application"
          disabled={!isImported}
        >
          {isImported && (
            <LoadingWrapper condition={isTabLoaded}>
              <ApplicationTab {...constructedProps} />
            </LoadingWrapper>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={props.renderTabTitle("Referral", "REF")}
          key="referral"
          disabled={!verificationComplete}
        >
          {verificationComplete && (
            <LoadingWrapper condition={isTabLoaded}>
              <ReferralTabs
                mineGuid={noticeOfWork.mine_guid}
                noticeOfWork={noticeOfWork}
                type="REF"
                fixedTop={props.fixedTop}
              />
            </LoadingWrapper>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={props.renderTabTitle("Consultation", "CON")}
          key="consultation"
          disabled={!verificationComplete}
        >
          {verificationComplete && (
            <LoadingWrapper condition={isTabLoaded}>
              <ReferralTabs
                mineGuid={noticeOfWork.mine_guid}
                noticeOfWork={noticeOfWork}
                type="FNC"
                fixedTop={props.fixedTop}
              />
            </LoadingWrapper>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={props.renderTabTitle("Public Comment", "PUB")}
          key="public-comment"
          disabled={!verificationComplete}
        >
          {verificationComplete && (
            <LoadingWrapper condition={isTabLoaded}>
              <ReferralTabs
                mineGuid={noticeOfWork.mine_guid}
                type="PUB"
                fixedTop={props.fixedTop}
              />
            </LoadingWrapper>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={props.renderTabTitle("Draft", "DFT")}
          key="draft-permit"
          disabled={!verificationComplete}
        >
          {verificationComplete && (
            <LoadingWrapper condition={isTabLoaded}>
              <DraftPermitTab {...constructedProps} />
            </LoadingWrapper>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="Process" key="process-permit" disabled={!verificationComplete}>
          {verificationComplete && (
            <LoadingWrapper condition={isTabLoaded}>
              <ProcessPermit
                mineGuid={noticeOfWork.mine_guid}
                noticeOfWork={noticeOfWork}
                fixedTop={props.fixedTop}
              />
            </LoadingWrapper>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Administrative" key="administrative" disabled={!verificationComplete}>
          {verificationComplete && (
            <LoadingWrapper condition={isTabLoaded}>
              <AdministrativeTab fixedTop={props.fixedTop} />
            </LoadingWrapper>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab="Manage Documents"
          key="manage-documents"
          disabled={!verificationComplete}
        >
          {verificationComplete && (
            <LoadingWrapper condition={isTabLoaded}>
              <ManageDocumentsTab fixedTop={props.fixedTop} />
            </LoadingWrapper>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={props.renderTabTitle("Search Documents", "SEA")}
          key="search-documents"
          disabled={!verificationComplete}
        >
          {verificationComplete && (
            <LoadingWrapper condition={isTabLoaded}>
              <NowApplicationDocumentSearchForm nowApplicationGuid={noticeOfWork.now_application_guid} />
            </LoadingWrapper>
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default ApplicationGuard(NoticeOfWorkApplication);
