/* eslint-disable */
import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { kebabCase } from "lodash";
import {
  fetchImportedNoticeOfWorkApplication,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { clearNoticeOfWorkApplication } from "@common/actions/noticeOfWorkActions";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { getInspectorsHash } from "@common/selectors/partiesSelectors";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import { getMines } from "@common/selectors/mineSelectors";
import {
  getDropdownNoticeOfWorkApplicationStatusOptions,
  getGeneratableNoticeOfWorkApplicationDocumentTypeOptions,
  getNoticeOfWorkApplicationStatusOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import * as routes from "@/constants/routes";
import DraftPermitTab from "@/components/noticeOfWork/applications/permitGeneration/DraftPermitTab";
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
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
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

export class AdminAmendmentApplication extends Component {
  state = {
    // isLoaded: false,
    isTabLoaded: false,
    // fixedTop: false,
    noticeOfWorkPageFromRoute: undefined,
    showNullScreen: false,
    activeTab: "application",
  };

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.noticeOfWorkPageFromRoute) {
      this.setState({
        noticeOfWorkPageFromRoute: this.props.location.state.noticeOfWorkPageFromRoute,
      });
    }

    if (this.props.match.params.id) {
      this.loadNoticeOfWork(this.props.match.params.id);
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
    // if (nextProps.match.params.id !== this.props.match.params.id) {
    //   this.loadNoticeOfWork(nextProps.match.params.id);
    // }

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
    this.props.fetchMineRecordById(mineGuid).then(() => {
      onMineInfoLoaded();
    });
  };

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab, isTabLoaded: true });
  };

  loadNoticeOfWork = async (id) => {
    this.setState({ isLoaded: false });
    await Promise.all([
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
      routes.ADMIN_AMENDMENT_APPLICATION.dynamicRoute(
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
    if (!this.props.isLoaded) {
      return <Loading />;
    }
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
          <Tabs.TabPane tab={this.renderTabTitle("Application", "REV")} key="application">
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ApplicationTab fixedTop={this.props.fixedTop} />
            </LoadingWrapper>
          </Tabs.TabPane>

          <Tabs.TabPane tab={this.renderTabTitle("Referral", "REF")} key="referral">
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ReferralTabs
                mineGuid={this.props.noticeOfWork.mine_guid}
                noticeOfWork={this.props.noticeOfWork}
                type="REF"
                fixedTop={this.props.fixedTop}
              />
            </LoadingWrapper>
          </Tabs.TabPane>

          <Tabs.TabPane tab={this.renderTabTitle("Consultation", "CON")} key="consultation">
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ReferralTabs
                mineGuid={this.props.noticeOfWork.mine_guid}
                noticeOfWork={this.props.noticeOfWork}
                type="FNC"
                fixedTop={this.props.fixedTop}
              />
            </LoadingWrapper>
          </Tabs.TabPane>
          <Tabs.TabPane tab={this.renderTabTitle("Draft", "DFT")} key="draft-permit">
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <DraftPermitTab fixedTop={this.props.fixedTop} />
            </LoadingWrapper>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Process" key="process-permit">
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <ProcessPermit
                mineGuid={this.props.noticeOfWork.mine_guid}
                noticeOfWork={this.props.noticeOfWork}
                fixedTop={this.props.fixedTop}
              />
            </LoadingWrapper>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Administrative" key="administrative">
            <LoadingWrapper condition={this.state.isTabLoaded}>
              <AdministrativeTab fixedTop={this.props.fixedTop} />
            </LoadingWrapper>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
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
      fetchImportNoticeOfWorkSubmissionDocumentsJob,
      fetchMineRecordById,
      clearNoticeOfWorkApplication,
    },
    dispatch
  );

AdminAmendmentApplication.propTypes = propTypes;
AdminAmendmentApplication.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationGuard(AdminAmendmentApplication));
