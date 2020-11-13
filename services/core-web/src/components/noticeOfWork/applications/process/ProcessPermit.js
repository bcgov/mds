import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Menu, Dropdown, Timeline, notification } from "antd";
import {
  DownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getDropdownNticeOfWorkApplicationStatusCodes } from "@common/selectors/staticContentSelectors";
import { getNOWProgress } from "@common/selectors/noticeOfWorkSelectors";
import {
  updateNoticeOfWorkStatus,
  fetchApplicationDelay,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@common/actions/modalActions";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";

/**
 * @class ProcessPermit - Process the permit. We've got to process this permit. Process this permit, proactively!
 */

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchApplicationDelay: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkStatus: PropTypes.func.isRequired,
  progress: PropTypes.objectOf(PropTypes.any).isRequired,
  progressStatusCodes: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
};

const defaultProps = {};

const TimelineItem = (progress, progressStatus) => {
  if (!progress[progressStatus.application_progress_status_code])
    return (
      <Timeline.Item dot={<StopOutlined className="icon-lg--grey" />}>
        <span className="field-title">{progressStatus.description}</span>
        <br />
        Not Started
      </Timeline.Item>
    );
  if (progress[progressStatus.application_progress_status_code].end_date)
    return (
      <Timeline.Item dot={<CheckCircleOutlined className="icon-lg--green" />}>
        <span className="field-title">{progressStatus.description}</span>
        <br />
        Complete
      </Timeline.Item>
    );
  return (
    <Timeline.Item dot={<ClockCircleOutlined className="icon-lg" />}>
      <span className="field-title">{progressStatus.description}</span>
      <br />
      In Progress
    </Timeline.Item>
  );
};

export class ProcessPermit extends Component {
  state = {};

  componentDidMount = () => {
    this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
  };

  openIssuePermitModal = () => {
    this.props.openModal({
      props: {
        title: "Issue Permit",
        onSubmit: this.issuePermit,
      },
      width: "50vw",
      content: modalConfig.ISSUE_PERMIT_MODAL,
    });
  };

  openRejectApplicationModal = () => {
    this.props.openModal({
      props: {
        title: "Reject Application",
        onSubmit: this.rejectApplication,
      },
      width: "50vw",
      content: modalConfig.REJECT_APPLICATION_MODAL,
    });
  };

  openWithdrawApplicationModal = () => {
    this.props.openModal({
      props: {
        title: "Withdraw Application",
        onSubmit: this.withdrawApplication,
      },
      width: "50vw",
      content: modalConfig.WITHDRAW_APPLICATION_MODAL,
    });
  };

  issuePermit = (values) => {
    this.props
      .updateNoticeOfWorkStatus(this.props.noticeOfWork.now_application_guid, {
        ...values,
        now_application_status_code: "AIA",
      })
      .then(() => {
        this.props.closeModal();
        notification.success({
          message: "Permit has been successfully issued for this application.",
          duration: 10,
        });
      });
  };

  rejectApplication = (values) => {
    this.props
      .updateNoticeOfWorkStatus(this.props.noticeOfWork.now_application_guid, {
        ...values,
        now_application_status_code: "REJ",
      })
      .then(() => this.props.closeModal());
  };

  withdrawApplication = (values) => {
    this.props
      .updateNoticeOfWorkStatus(this.props.noticeOfWork.now_application_guid, {
        ...values,
        now_application_status_code: "WDN",
      })
      .then(() => this.props.closeModal());
  };

  canIssuePermit = () => {
    const progressComplete = this.props.progressStatusCodes.every(
      (progressStatus) =>
        this.props.progress[progressStatus.application_progress_status_code] &&
        this.props.progress[progressStatus.application_progress_status_code].end_date
    );
    return progressComplete;
  };

  menu = () => (
    <Menu>
      <Menu.Item
        key="issue-permit"
        onClick={this.openIssuePermitModal}
        disabled={!this.canIssuePermit()}
      >
        Issue permit
      </Menu.Item>
      <Menu.Item key="reject-application" onClick={this.openRejectApplicationModal}>
        Reject application
      </Menu.Item>
      <Menu.Item key="withdraw-application" onClick={this.openWithdrawApplicationModal}>
        Withdraw application
      </Menu.Item>
    </Menu>
  );

  render = () => (
    <div>
      <div className="view--header">
        <div className="inline-flex block-mobile padding-md">
          <h2>Process Permit</h2>
          <Dropdown overlay={this.menu()} placement="bottomLeft">
            <Button type="secondary" className="full-mobile">
              Process
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <NOWStatusIndicator type="banner" />
      </div>
      <>
        <div className="side-menu--timeline">
          <Timeline>
            {this.props.progressStatusCodes
              .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
              .map((progressStatus) => TimelineItem(this.props.progress, progressStatus))}
          </Timeline>
        </div>
        <div className="view--content side-menu--content" />
      </>
    </div>
  );
}

ProcessPermit.propTypes = propTypes;
ProcessPermit.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  progress: getNOWProgress(state),
  progressStatusCodes: getDropdownNticeOfWorkApplicationStatusCodes(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkStatus,
      fetchApplicationDelay,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProcessPermit);
