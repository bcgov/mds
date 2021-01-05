import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { flattenObject } from "@common/utils/helpers";
import { PropTypes } from "prop-types";
import { getFormValues, submit, getFormSyncErrors } from "redux-form";
import { openModal, closeModal } from "@common/actions/modalActions";
import { Button, Dropdown, Menu } from "antd";
import { isEmpty } from "lodash";
import { createPermit, createPermitAmendment } from "@common/actionCreators/permitActionCreator";
import CustomPropTypes from "@/customPropTypes";
import {
  createNoticeOfWorkApplicationProgress,
  updateNoticeOfWorkApplicationProgress,
  fetchImportedNoticeOfWorkApplication,
  updateApplicationDelay,
  createApplicationDelay,
  fetchApplicationDelay,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { getPermits } from "@common/selectors/permitSelectors";
import {
  getNoticeOfWork,
  getNOWProgress,
  getApplicationDelay,
} from "@common/selectors/noticeOfWorkSelectors";
import {
  getDelayTypeDropDownOptions,
  getNoticeOfWorkApplicationProgressStatusCodeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
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
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  closeModal: PropTypes.func.isRequired,
  createNoticeOfWorkApplicationProgress: PropTypes.func.isRequired,
  updateNoticeOfWorkApplicationProgress: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  updateApplicationDelay: PropTypes.func.isRequired,
  createApplicationDelay: PropTypes.func.isRequired,
  fetchApplicationDelay: PropTypes.func.isRequired,
  handleDraftPermit: PropTypes.func,
  createPermit: PropTypes.func.isRequired,
  createPermitAmendment: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  formErrors: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  preDraftFormValues: PropTypes.objectOf(PropTypes.oneOfType[(PropTypes.string, PropTypes.bool)])
    .isRequired,
};

const defaultProps = { handleDraftPermit: () => {} };

export class NOWProgressActions extends Component {
  componentDidMount() {
    this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.noticeOfWork !== this.props.noticeOfWork)
      this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
  };

  createPermit = (isExploration, tab, trigger) => {
    const payload = {
      permit_status_code: "D",
      is_exploration: isExploration,
      now_application_guid: this.props.noticeOfWork.now_application_guid,
    };
    this.props.createPermit(this.props.noticeOfWork.mine_guid, payload).then(() => {
      this.startOrResumeProgress(tab, trigger);
      this.props.handleDraftPermit();
    });
  };

  startDraftPermit = (tab, trigger, isAmendment) => {
    if (isAmendment) {
      const payload = {
        permit_amendment_status_code: "DFT",
        now_application_guid: this.props.noticeOfWork.now_application_guid,
      };
      this.props
        .createPermitAmendment(
          this.props.noticeOfWork.mine_guid,
          this.props.preDraftFormValues.permit_guid,
          payload
        )
        .then(() => {
          this.props.handleDraftPermit();
          this.startOrResumeProgress(tab, trigger);
        });
    } else {
      this.createPermit(this.props.preDraftFormValues.is_exploration, tab, trigger);
    }
  };

  handleProgress = (tab, trigger, isAmendment) => {
    if (trigger === "Complete") {
      this.stopProgress(tab);
    } else if (trigger === "Resume") {
      this.startOrResumeProgress(tab, trigger);
    } else if (trigger === "Start") {
      if (tab === "DFT") {
        this.handlePermit(tab, trigger, isAmendment);
      } else {
        this.startOrResumeProgress(tab, trigger);
      }
    }
  };

  handlePermit = (tab, trigger, isAmendment) => {
    const errors = Object.keys(flattenObject(this.props.formErrors));
    this.props.submit(FORM.PRE_DRAFT_PERMIT);
    if (errors.length === 0) {
      this.startDraftPermit(tab, trigger, isAmendment);
    }
  };

  stopProgress = (tab) => {
    const message = `Successfully Completed the ${this.props.progressStatusHash[tab]} Process.`;
    this.props
      .updateNoticeOfWorkApplicationProgress(
        this.props.noticeOfWork.now_application_guid,
        tab,
        {
          end_date: new Date(),
        },
        message
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });
  };

  startOrResumeProgress = (tab, trigger) => {
    const ending = trigger === "Start" ? "ed" : "d";
    const message = `Successfully ${trigger}${ending} the ${this.props.progressStatusHash[tab]} Process.`;
    this.props
      .createNoticeOfWorkApplicationProgress(
        this.props.noticeOfWork.now_application_guid,
        tab,
        message
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });
  };

  handleStartDelay = (values) => {
    const payload = {
      ...values,
      start_date: new Date().toISOString(),
    };
    this.props
      .createApplicationDelay(this.props.noticeOfWork.now_application_guid, payload)
      .then(() => {
        this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
        this.props.closeModal();
      });
  };

  handleStopDelay = (values) => {
    const payload = {
      ...values,
      end_date: new Date().toISOString(),
    };
    this.props
      .updateApplicationDelay(
        this.props.noticeOfWork.now_application_guid,
        this.props.applicationDelay.now_application_delay_guid,
        payload
      )
      .then(() => {
        this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
        this.props.closeModal();
      });
  };

  openProgressModal = (trigger) => {
    this.props.openModal({
      props: {
        title: `${trigger} ${this.props.progressStatusHash[this.props.tab]}`,
        tab: this.props.progressStatusHash[this.props.tab],
        tabCode: this.props.tab,
        closeModal: this.props.closeModal,
        trigger,
        handleProgress: this.handleProgress,
        permits: this.props.permits,
        isAmendment: this.props.noticeOfWork.type_of_application !== "New Permit",
        isCoalOrMineral:
          this.props.noticeOfWork.notice_of_work_type_code === "MIN" ||
          this.props.noticeOfWork.notice_of_work_type_code === "COL",
      },
      content: modalConfig.NOW_PROGRESS_MODAL,
    });
  };

  openStatusReasonModal = (title) => {
    this.props.openModal({
      props: {
        title,
        closeModal: this.props.closeModal,
        applicationDelay: this.props.applicationDelay,
      },
      isViewOnly: true,
      content: modalConfig.NOW_STATUS_REASON_MODAL,
    });
  };

  openHandleDelayModal = (stage) => {
    const submitFunction = stage === "Start" ? this.handleStartDelay : this.handleStopDelay;
    this.props.openModal({
      props: {
        title: `${stage} Delay`,
        onSubmit: submitFunction,
        delayTypeOptions: this.props.delayTypeOptions,
        initialValues: stage === "Stop" ? this.props.applicationDelay : {},
        stage,
        closeModal: this.props.closeModal,
      },
      content: modalConfig.NOW_DELAY_MODAL,
    });
  };

  render() {
    const isApplicationDelayed = !isEmpty(this.props.applicationDelay);
    const isProcessed =
      this.props.noticeOfWork.now_application_status_code === "AIA" ||
      this.props.noticeOfWork.now_application_status_code === "REJ";
    const rejected = this.props.noticeOfWork.now_application_status_code === "REJ";
    const reasonButtonTitle = isApplicationDelayed ? "Reason for Delay" : "Reason for Rejection";
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
    const showReasonModal = rejected || isApplicationDelayed;
    return (
      <div className="inline-flex progress-actions">
        <>
          {!(isApplicationDelayed || isProcessed) && showActions && (
            <>
              {!this.props.progress[this.props.tab] && (
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <Button type="primary" onClick={() => this.openProgressModal("Start")}>
                    <ClockCircleOutlined />
                    Start {this.props.progressStatusHash[this.props.tab]}
                  </Button>
                </AuthorizationWrapper>
              )}
              {this.props.progress[this.props.tab] &&
                this.props.progress[this.props.tab].start_date &&
                !this.props.progress[this.props.tab].end_date && (
                  <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                    <Button type="primary" onClick={() => this.openProgressModal("Complete")}>
                      <ClockCircleOutlined />
                      Complete {this.props.progressStatusHash[this.props.tab]}
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
  preDraftFormValues: getFormValues(FORM.PRE_DRAFT_PERMIT)(state),
  formErrors: getFormSyncErrors(FORM.PRE_DRAFT_PERMIT)(state),
  permits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      createNoticeOfWorkApplicationProgress,
      updateNoticeOfWorkApplicationProgress,
      fetchImportedNoticeOfWorkApplication,
      createPermit,
      createPermitAmendment,
      updateApplicationDelay,
      createApplicationDelay,
      fetchApplicationDelay,
      submit,
    },
    dispatch
  );
export default connect(mapStateToProps, mapDispatchToProps)(NOWProgressActions);
