/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { PropTypes } from "prop-types";
import { openModal, closeModal } from "@common/actions/modalActions";
import { Button, Dropdown, Menu } from "antd";
import CustomPropTypes from "@/customPropTypes";
import {
  createNoticeOfWorkApplicationProgress,
  updateNoticeOfWorkApplicationProgress,
  fetchImportedNoticeOfWorkApplication,
  updateApplicationDelay,
  createApplicationDelay,
  fetchApplicationDelay,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import { ClockCircleOutlined, EyeOutlined, DownOutlined } from "@ant-design/icons";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { getNoticeOfWorkApplicationProgressStatusCodeOptionsHash } from "@common/selectors/staticContentSelectors";

/**
 * @constant NOWProgressActions conditionally renders NoW progress actions for each tab
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  tab: PropTypes.string.isRequired,
  createNoticeOfWorkApplicationProgress: PropTypes.func.isRequired,
  updateNoticeOfWorkApplicationProgress: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  updateApplicationDelay: PropTypes.func.isRequired,
  createApplicationDelay: PropTypes.func.isRequired,
  fetchApplicationDelay: PropTypes.func.isRequired,
};

const defaultProps = {};

export class NOWProgressActions extends Component {
  componentDidMount() {
    this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
  }
  handleProgress = (tab, trigger) => {
    if (trigger === "Complete") {
      this.props
        .updateNoticeOfWorkApplicationProgress(this.props.noticeOfWork.now_application_guid, tab, {
          end_date: new Date(),
        })
        .then(() => {
          this.props.fetchImportedNoticeOfWorkApplication(
            this.props.noticeOfWork.now_application_guid
          );
          this.props.closeModal();
        });
    } else {
      this.props
        .createNoticeOfWorkApplicationProgress(this.props.noticeOfWork.now_application_guid, tab)
        .then(() => {
          this.props.fetchImportedNoticeOfWorkApplication(
            this.props.noticeOfWork.now_application_guid
          );
          this.props.closeModal();
        });
    }
  };

  handleStartDelay = (values) => {
    console.log(values);
    this.props
      .createApplicationDelay(this.props.noticeOfWork.now_application_guid, values)
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
      },
      content: modalConfig.NOW_PROGRESS_MODAL,
    });
  };

  openReasonForDelay = () => {
    this.props.openModal({
      props: {
        title: "Reason for delay",
        closeModal: this.props.closeModal,
      },
      isViewOnly: true,
      content: modalConfig.NOW_REASON_FOR_DELAY_MODAL,
    });
  };

  openHandleDelayModal = () => {
    this.props.openModal({
      props: {
        title: "Start Delay",
        onSubmit: this.handleStartDelay,
      },
      content: modalConfig.NOW_DELAY_MODAL,
    });
  };

  render() {
    const menu = (
      <Menu>
        <Menu.Item onClick={this.openHandleDelayModal}> Start Delay</Menu.Item>
        <Menu.Item>Stop Delay</Menu.Item>
      </Menu>
    );

    return (
      <div className="inline-flex">
        {true && this.props.tab !== "ADMIN" && (
          <>
            <Button type="primary" onClick={() => this.openProgressModal("Start")}>
              <ClockCircleOutlined />
              Start {this.props.progressStatusHash[this.props.tab]}
            </Button>
            <Button type="primary" onClick={() => this.openProgressModal("Complete")}>
              <ClockCircleOutlined />
              Complete {this.props.progressStatusHash[this.props.tab]}
            </Button>
            <Button type="primary" onClick={() => this.openProgressModal("Resume")}>
              <ClockCircleOutlined />
              Resume {this.props.progressStatusHash[this.props.tab]}
            </Button>
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
        {true && (
          <Button type="primary" onClick={this.openReasonForDelay}>
            <EyeOutlined /> View Reason for Delay
          </Button>
        )}
      </div>
    );
  }
}

NOWProgressActions.propTypes = propTypes;
NOWProgressActions.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  progressStatusHash: getNoticeOfWorkApplicationProgressStatusCodeOptionsHash(state),
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
