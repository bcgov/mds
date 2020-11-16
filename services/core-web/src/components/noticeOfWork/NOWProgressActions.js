import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { PropTypes } from "prop-types";
import { getFormValues } from "redux-form";
import { openModal, closeModal } from "@common/actions/modalActions";
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
  startDraftPermit: PropTypes.func,
};

const defaultProps = { startDraftPermit: () => {} };

export class NOWProgressActions extends Component {
  componentDidMount() {
    this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
  }

  handleProgress = (tab, trigger) => {
    const message = `Successfully ${trigger}ed the ${this.props.progressStatusHash[tab]} Process.`;
    if (trigger === "Complete") {
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
          if (tab === "DFT") {
            this.props.startDraftPermit();
          }
          this.props.fetchImportedNoticeOfWorkApplication(
            this.props.noticeOfWork.now_application_guid
          );
          this.props.closeModal();
        });
    } else {
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
    }
  };

  handleStartDelay = (values) => {
    const payload = {
      ...values,
      // start_date: new Date(this.props.noticeOfWork.last_updated_date),
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
      },
      content: modalConfig.NOW_PROGRESS_MODAL,
    });
  };

  openReasonForDelay = () => {
    this.props.openModal({
      props: {
        title: "Reason for delay",
        closeModal: this.props.closeModal,
        applicationDelay: this.props.applicationDelay,
      },
      isViewOnly: true,
      content: modalConfig.NOW_REASON_FOR_DELAY_MODAL,
    });
  };

  openHandleDelayModal = (stage) => {
    const submit = stage === "Start" ? this.handleStartDelay : this.handleStopDelay;
    this.props.openModal({
      props: {
        title: `${stage} Delay`,
        onSubmit: submit,
        delayTypeOptions: this.props.delayTypeOptions,
        initialValues: stage === "Stop" ? this.props.applicationDelay : {},
        stage,
        closeModal: this.props.closeModal,
      },
      content: modalConfig.NOW_DELAY_MODAL,
    });
  };

  render() {
    console.log(this.props.applicationDelay);
    const isApplicationDelayed = !isEmpty(this.props.applicationDelay);
    const isProcessed =
      this.props.noticeOfWork.now_application_status_code === "AIA" ||
      this.props.noticeOfWork.now_application_status_code === "WDN" ||
      this.props.noticeOfWork.now_application_status_code === "REJ";
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

    return (
      <div className="inline-flex">
        <>
          {!(isApplicationDelayed || isProcessed) && this.props.tab !== "ADMIN" && (
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
          {this.props.tab === "ADMIN" && (
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              <Dropdown overlay={menu} placement="bottomLeft">
                <Button type="secondary">
                  Manage Delay
                  <DownOutlined />
                </Button>
              </Dropdown>
            </AuthorizationWrapper>
          )}
          {isApplicationDelayed && !isProcessed && (
            <Button type="primary" onClick={this.openReasonForDelay}>
              <EyeOutlined /> View Reason for Delay
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
      updateApplicationDelay,
      createApplicationDelay,
      fetchApplicationDelay,
    },
    dispatch
  );
export default connect(mapStateToProps, mapDispatchToProps)(NOWProgressActions);
