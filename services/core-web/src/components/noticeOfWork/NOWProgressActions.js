import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { PropTypes } from "prop-types";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { Button, Dropdown, Menu } from "antd";
import { isEmpty } from "lodash";
import CustomPropTypes from "@/customPropTypes";
import {
  createNoticeOfWorkApplicationProgress,
  updateNoticeOfWorkApplicationProgress,
  fetchImportedNoticeOfWorkApplication,
  updateApplicationDelay,
  createApplicationDelay,
  fetchApplicationDelay,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWork,
  getNOWProgress,
  getApplicationDelay,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  getDelayTypeDropDownOptions,
  getNoticeOfWorkApplicationProgressStatusCodeOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getDraftPermitAmendmentForNOW } from "@mds/common/redux/selectors/permitSelectors";
import { ClockCircleOutlined, EyeOutlined, DownOutlined } from "@ant-design/icons";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

/**
 * @constant NOWProgressActions conditionally renders NoW progress actions for each tab
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  progressStatusHash: PropTypes.objectOf(PropTypes.string).isRequired,
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
  delayTypeOptions: CustomPropTypes.options.isRequired,
  tab: PropTypes.string.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createNoticeOfWorkApplicationProgress: PropTypes.func.isRequired,
  updateNoticeOfWorkApplicationProgress: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  updateApplicationDelay: PropTypes.func.isRequired,
  createApplicationDelay: PropTypes.func.isRequired,
  fetchApplicationDelay: PropTypes.func.isRequired,
  handleDraftPermit: PropTypes.func,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
  isNoticeOfWorkTypeDisabled: PropTypes.bool,
};

const defaultProps = {
  handleDraftPermit: () => {},
  isNoticeOfWorkTypeDisabled: true,
};

export class NOWProgressActions extends Component {
  componentDidMount() {
    this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.noticeOfWork !== this.props.noticeOfWork) {
      this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
    }
  };

  handleProgress = (tab, trigger) =>
    trigger === "Complete" ? this.stopProgress(tab) : this.startOrResumeProgress(tab, trigger);

  stopProgress = (tab) =>
    this.props
      .updateNoticeOfWorkApplicationProgress(
        this.props.noticeOfWork.now_application_guid,
        tab,
        {},
        `Successfully Completed the ${this.props.progressStatusHash[tab]} Process.`
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });

  startOrResumeProgress = (tab, trigger) =>
    this.props
      .createNoticeOfWorkApplicationProgress(
        this.props.noticeOfWork.now_application_guid,
        tab,
        `Successfully ${trigger}${trigger === "Start" ? "ed" : "d"} the ${
          this.props.progressStatusHash[tab]
        } Process.`
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });

  handleStartDelay = (values) =>
    this.props
      .createApplicationDelay(this.props.noticeOfWork.now_application_guid, values)
      .then(() => {
        this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });

  handleStopDelay = (values) =>
    this.props
      .updateApplicationDelay(
        this.props.noticeOfWork.now_application_guid,
        this.props.applicationDelay.now_application_delay_guid,
        values
      )
      .then(() => {
        this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });

  openProgressModal = (trigger) =>
    this.props.openModal({
      props: {
        title: `${trigger} ${this.props.progressStatusHash[this.props.tab]}`,
        tab: this.props.progressStatusHash[this.props.tab],
        tabCode: this.props.tab,
        closeModal: this.props.closeModal,
        trigger,
        handleProgress: this.handleProgress,
      },
      content: modalConfig.NOW_PROGRESS_MODAL,
    });

  openDraftPermitProgressModal = () =>
    this.props.openModal({
      props: {
        title: `Start ${this.props.progressStatusHash[this.props.tab]}`,
        tab: this.props.progressStatusHash[this.props.tab],
        tabCode: this.props.tab,
        closeModal: this.props.closeModal,
        handleDraftPermit: this.props.handleDraftPermit,
        isCoalOrMineral:
          this.props.noticeOfWork.notice_of_work_type_code === "MIN" ||
          this.props.noticeOfWork.notice_of_work_type_code === "COL",
        noticeOfWork: this.props.noticeOfWork,
        startOrResumeProgress: this.startOrResumeProgress,
        isNoticeOfWorkTypeDisabled: this.props.isNoticeOfWorkTypeDisabled,
      },
      content: modalConfig.START_DRAFT_PERMIT_MODAL,
    });

  openStatusReasonModal = (title) =>
    this.props.openModal({
      props: {
        title,
        closeModal: this.props.closeModal,
        applicationDelay: this.props.applicationDelay,
      },
      isViewOnly: true,
      content: modalConfig.NOW_STATUS_REASON_MODAL,
    });

  openHandleDelayModal = (stage) =>
    this.props.openModal({
      props: {
        title: `${stage} Delay`,
        onSubmit: stage === "Start" ? this.handleStartDelay : this.handleStopDelay,
        delayTypeOptions: this.props.delayTypeOptions,
        initialValues: stage === "Stop" ? this.props.applicationDelay : {},
        stage,
        closeModal: this.props.closeModal,
      },
      content: modalConfig.NOW_DELAY_MODAL,
    });

  render() {
    const isApplicationDelayed = !isEmpty(this.props.applicationDelay);
    const isProcessed = ["AIA", "REJ", "WDN", "NPR"].includes(
      this.props.noticeOfWork.now_application_status_code
    );
    const processedWithReason = ["REJ", "WDN", "NPR"].includes(
      this.props.noticeOfWork.now_application_status_code
    );
    const reasonButtonTitle = isApplicationDelayed ? "Reason for Delay" : "Status Reason";
    const menu = (
      <Menu>
        <Menu.Item
          onClick={() => this.openHandleDelayModal("Start")}
          disabled={isApplicationDelayed || isProcessed}
        >
          Start Delay
        </Menu.Item>
        <Menu.Item
          disabled={!isApplicationDelayed || isProcessed}
          onClick={() => this.openHandleDelayModal("Stop")}
        >
          Stop Delay
        </Menu.Item>
      </Menu>
    );

    const showActions = this.props.tab !== "ADMIN" && this.props.tab !== "PRO";
    const isDeletedDraftPermitInProgress =
      this.props.progress[this.props.tab] &&
      this.props.progress[this.props.tab].start_date &&
      !this.props.progress[this.props.tab].end_date &&
      this.props.tab === "DFT" &&
      isEmpty(this.props.draftPermitAmendment);
    const showReasonModal = processedWithReason || isApplicationDelayed;
    return (
      <div className="inline-flex progress-actions">
        <>
          {!isProcessed && showActions && (
            <>
              {!this.props.progress[this.props.tab] && (
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <Button
                    type="primary"
                    onClick={() =>
                      this.props.tab === "DFT"
                        ? this.openDraftPermitProgressModal()
                        : this.openProgressModal("Start")
                    }
                  >
                    <ClockCircleOutlined />
                    Start {this.props.progressStatusHash[this.props.tab]}
                  </Button>
                </AuthorizationWrapper>
              )}
              {this.props.progress[this.props.tab] &&
                this.props.progress[this.props.tab].start_date &&
                !this.props.progress[this.props.tab].end_date && (
                  <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                    <Button
                      type="primary"
                      onClick={() => this.openProgressModal("Complete")}
                      disabled={isDeletedDraftPermitInProgress}
                      title={
                        isDeletedDraftPermitInProgress
                          ? "The Draft process cannot be completed without a creating a Draft Permit"
                          : ""
                      }
                    >
                      <ClockCircleOutlined />
                      Complete {this.props.progressStatusHash[this.props.tab]}
                    </Button>
                  </AuthorizationWrapper>
                )}
              {/* allow users to recreate the draft permit if deleted */}
              {isDeletedDraftPermitInProgress && (
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <Button type="primary" onClick={() => this.openDraftPermitProgressModal()}>
                    Create {this.props.progressStatusHash[this.props.tab]}
                  </Button>
                </AuthorizationWrapper>
              )}
              {this.props.progress[this.props.tab] && this.props.progress[this.props.tab].end_date && (
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <Button type="primary" onClick={() => this.openProgressModal("Resume")}>
                    <ClockCircleOutlined />
                    Resume {this.props.progressStatusHash[this.props.tab]}
                  </Button>
                </AuthorizationWrapper>
              )}
            </>
          )}
          {this.props.tab === "ADMIN" && !isProcessed && (
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              <Dropdown overlay={menu} placement="bottomLeft">
                <Button type="secondary">
                  Manage Delay
                  <DownOutlined />
                </Button>
              </Dropdown>
            </AuthorizationWrapper>
          )}
          {showReasonModal && (
            <Button type="primary" onClick={() => this.openStatusReasonModal(reasonButtonTitle)}>
              <EyeOutlined />
              View {reasonButtonTitle}
            </Button>
          )}
        </>
      </div>
    );
  }
}

NOWProgressActions.propTypes = propTypes;
NOWProgressActions.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  progressStatusHash: getNoticeOfWorkApplicationProgressStatusCodeOptionsHash(state),
  progress: getNOWProgress(state),
  applicationDelay: getApplicationDelay(state),
  delayTypeOptions: getDelayTypeDropDownOptions(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      createNoticeOfWorkApplicationProgress,
      updateNoticeOfWorkApplicationProgress,
      fetchImportedNoticeOfWorkApplication,
      updateApplicationDelay,
      createApplicationDelay,
      fetchApplicationDelay,
    },
    dispatch
  );
export default connect(mapStateToProps, mapDispatchToProps)(NOWProgressActions);
