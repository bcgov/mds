import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { isEmpty } from "lodash";
import { Button, Menu, Popconfirm, Dropdown, Result, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { formatDate } from "@common/utils/helpers";
import { getFormValues, reset } from "redux-form";
import { getNoticeOfWorkApplicationTypeOptions } from "@common/selectors/staticContentSelectors";
import {
  createPermit,
  fetchPermits,
  createPermitAmendment,
  updatePermitAmendment,
  fetchDraftPermitByNOW,
} from "@common/actionCreators/permitActionCreator";
import { updateNoticeOfWorkStatus } from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getPermits,
  getDraftPermitForNOW,
  getDraftPermitAmendmentForNOW,
} from "@common/selectors/permitSelectors";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import GeneratePermitForm from "@/components/Forms/permits/GeneratePermitForm";
import PreDraftPermitForm from "@/components/Forms/permits/PreDraftPermitForm";
import NullScreen from "@/components/common/NullScreen";
import * as routes from "@/constants/routes";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@common/actions/modalActions";

/**
 * @class ProcessPermit - Process the permit. We've got to process this permit. Process this permit, proactively!
 */

const propTypes = {
  openModal: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  mineGuid: PropTypes.string.isRequired,
  updateNoticeOfWorkStatus: PropTypes.func.isRequired,
};

const defaultProps = {};
export class ProcessPermit extends Component {
  state = {};

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
      .then(() => this.props.closeModal());
  };

  rejectApplication = () => {
    this.props
      .updateNoticeOfWorkStatus(this.props.noticeOfWork.now_application_guid, {
        ...values,
        now_application_status_code: "REJ",
      })
      .then(() => this.props.closeModal());
  };

  withdrawApplication = () => {
    this.props
      .updateNoticeOfWorkStatus(this.props.noticeOfWork.now_application_guid, {
        ...values,
        now_application_status_code: "WDN",
      })
      .then(() => this.props.closeModal());
  };

  menu = () => (
    <Menu>
      <Menu.Item key="issue-permit" onClick={this.openIssuePermitModal}>
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

  render() {
    return (
      <div>
        {" "}
        Process Permit
        <Dropdown overlay={this.menu()} placement="bottomLeft">
          <Button type="secondary" className="full-mobile">
            Process
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    );
  }
}

ProcessPermit.propTypes = propTypes;
ProcessPermit.defaultProps = defaultProps;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkStatus,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProcessPermit);
