/* eslint-disable */
import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { kebabCase } from "lodash";
import {
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { clearNoticeOfWorkApplication } from "@common/actions/noticeOfWorkActions";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { getInspectorsHash } from "@common/selectors/partiesSelectors";
import { getNoticeOfWork, getOriginalNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import { getMines } from "@common/selectors/mineSelectors";
import {
  getDropdownNoticeOfWorkApplicationStatusOptions,
  getGeneratableNoticeOfWorkApplicationDocumentTypeOptions,
  getNoticeOfWorkApplicationStatusOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import * as routes from "@/constants/routes";
import DraftPermitTab from "@/components/noticeOfWork/applications/permitGeneration/DraftPermitTab";
import VerificationTab from "@/components/noticeOfWork/applications/verification/VerificationTab";
import ApplicationTab from "@/components/noticeOfWork/applications/review/ApplicationTab";
import ReferralTabs from "@/components/noticeOfWork/applications/referals/ReferralTabs";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import NoticeOfWorkPageHeader from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import AdministrativeTab from "@/components/noticeOfWork/applications/administrative/AdministrativeTab";
import Loading from "@/components/common/Loading";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
import ProcessPermit from "@/components/noticeOfWork/applications/process/ProcessPermit";
import ApplicationGuard from "@/HOC/ApplicationGuard";

/**
 * @class NoticeOfWorkApplication- contains all information regarding a CORE notice of work application
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchOriginalNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportNoticeOfWorkSubmissionDocumentsJob: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
    location: PropTypes.shape({
      state: PropTypes.shape({ mineGuid: PropTypes.string, permitGuid: PropTypes.string }),
    }),
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      noticeOfWorkPageFromRoute: CustomPropTypes.noticeOfWorkPageFromRoute,
    }),
  }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  noticeOfWorkApplicationStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  clearNoticeOfWorkApplication: PropTypes.func.isRequired,
  fixedTop: PropTypes.bool.isRequired,
};

const defaultProps = {
  noticeOfWork: {},
};

export class NoticeOfWorkApplication extends Component {
  state = {
    isLoaded: false,
    isTabLoaded: false,
    isMajorMine: undefined,
    // fixedTop: false,
    noticeOfWorkPageFromRoute: undefined,
    showNullScreen: false,
    initialPermitGuid: "",
    isNewApplication: false,
    mineGuid: undefined,
    activeTab: "verification",
  };

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.noticeOfWorkPageFromRoute) {
      this.setState({
        noticeOfWorkPageFromRoute: this.props.location.state.noticeOfWorkPageFromRoute,
      });
    }

    const isNewApplication = !!this.props.history.location.state;
    if (this.props.match.params.id) {
      this.loadNoticeOfWork(this.props.match.params.id);
    } else if (isNewApplication) {
      this.loadCreatePermitApplication();
      this.setState({ isNewApplication });
    }

    if (this.props.match.params.tab) {
      this.setActiveTab(this.props.match.params.tab);
    }

    if (!this.props.history.location.state && !this.props.match.params.id) {
      this.setState({ showNullScreen: true });
    }

    // window.addEventListener("scroll", this.handleScroll);
    // this.handleScroll();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.loadNoticeOfWork(nextProps.match.params.id);
    }

    if (nextProps.match.params.tab !== this.props.match.params.tab) {
      this.setState({ isTabLoaded: false });
      this.setActiveTab(nextProps.match.params.tab);
    }
  }

  componentWillUnmount() {
    this.props.clearNoticeOfWorkApplication();
    // window.removeEventListener("scroll", this.handleScroll);
  }

  loadMineInfo = (mineGuid, onMineInfoLoaded = () => {}) => {
    this.props.fetchMineRecordById(mineGuid).then(({ data }) => {
      this.setState({ isMajorMine: data.major_mine_ind, mineGuid: data.mine_guid });
      onMineInfoLoaded();
    });
  };

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab, isTabLoaded: true });
  };

  loadCreatePermitApplication = () => {
    const { mineGuid, permitGuid } = this.props.history.location.state;
    this.loadMineInfo(mineGuid);
    this.setState({
      initialPermitGuid: permitGuid,
      isLoaded: true,
    });
  };

  loadNoticeOfWork = async (id) => {
    this.setState({ isLoaded: false });
    await Promise.all([
      this.props.fetchOriginalNoticeOfWorkApplication(id),
      this.props.fetchImportedNoticeOfWorkApplication(id).then(({ data }) => {
        if (data.imported_to_core && this.props.match.params.tab === "verification") {
          this.handleTabChange("application");
        }
        this.loadMineInfo(data.mine_guid, this.setState({ isLoaded: true }));
      }),
      this.props.fetchImportNoticeOfWorkSubmissionDocumentsJob(id),
    ]);
  };

  // handleScroll = () => {
  //   if (window.pageYOffset > 170 && !this.props.fixedTop) {
  //     this.setState({ fixedTop: true });
  //   } else if (window.pageYOffset <= 170 && this.props.fixedTop) {
  //     this.setState({ fixedTop: false });
  //   }
  // };

  handleTabChange = (key) => {
    this.props.history.replace(
      routes.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
        this.props.noticeOfWork.now_application_guid,
        kebabCase(key)
      )
    );
  };

  renderTabTitle = (title, tabSection) => (
    <span>
      <NOWStatusIndicator type="badge" tabSection={tabSection} />
      {title}
    </span>
  );

  render() {
    if (this.state.showNullScreen) {
      return <NullScreen type="unauthorized-page" />;
    }
    if (!this.state.isLoaded) {
      return <Loading />;
    }
    const isImported = this.props.noticeOfWork.imported_to_core;
    const verificationComplete = isImported && this.props.noticeOfWork.lead_inspector_party_guid;
    return (
      <div className="page">
        <NoticeOfWorkPageHeader
          noticeOfWork={this.props.noticeOfWork}
          inspectorsHash={this.props.inspectorsHash}
          noticeOfWorkPageFromRoute={this.state.noticeOfWorkPageFromRoute}
          noticeOfWorkApplicationStatusOptionsHash={
            this.props.noticeOfWorkApplicationStatusOptionsHash
          }
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
                isNewApplication={this.state.isNewApplication}
                loadMineData={this.loadMineInfo}
                isMajorMine={this.state.isMajorMine}
                noticeOfWork={this.props.noticeOfWork}
                mineGuid={this.state.mineGuid}
                loadNoticeOfWork={this.loadNoticeOfWork}
                initialPermitGuid={this.state.initialPermitGuid}
                originalNoticeOfWork={this.props.originalNoticeOfWork}
                handleTabChange={this.handleTabChange}
              />
            </Tabs.TabPane>
          )}

          <Tabs.TabPane
            tab={this.renderTabTitle("Application", "REV")}
            key="application"
            disabled={!isImported}
          >
            {isImported && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <ApplicationTab fixedTop={this.props.fixedTop} />
              </LoadingWrapper>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={this.renderTabTitle("Referral", "REF")}
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
            tab={this.renderTabTitle("Consultation", "CON")}
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
            tab={this.renderTabTitle("Public Comment", "PUB")}
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
            tab={this.renderTabTitle("Draft", "DFT")}
            key="draft-permit"
            disabled={!verificationComplete}
          >
            {verificationComplete && (
              <LoadingWrapper condition={this.state.isTabLoaded}>
                <DraftPermitTab fixedTop={this.props.fixedTop} />
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
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  originalNoticeOfWork: getOriginalNoticeOfWork(state),
  mines: getMines(state),
  inspectorsHash: getInspectorsHash(state),
  applicationStatusOptions: getDropdownNoticeOfWorkApplicationStatusOptions(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  noticeOfWorkApplicationStatusOptionsHash: getNoticeOfWorkApplicationStatusOptionsHash(state),
  documentContextTemplate: getDocumentContextTemplate(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchImportedNoticeOfWorkApplication,
      fetchOriginalNoticeOfWorkApplication,
      fetchImportNoticeOfWorkSubmissionDocumentsJob,
      fetchMineRecordById,
      clearNoticeOfWorkApplication,
    },
    dispatch
  );

NoticeOfWorkApplication.propTypes = propTypes;
NoticeOfWorkApplication.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationGuard(NoticeOfWorkApplication));
