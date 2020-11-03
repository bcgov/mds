import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  createNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
  importNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import CustomPropTypes from "@/customPropTypes";
import MajorMinePermitApplicationCreate from "@/components/noticeOfWork/applications/verification/MajorMinePermitApplicationCreate";
import VerifyApplicationInformationForm from "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  importNoticeOfWorkApplication: PropTypes.func.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  handleTabChange: PropTypes.func.isRequired,
  loadNoticeOfWork: PropTypes.func.isRequired,
  initialPermitGuid: PropTypes.string,
  loadMineData: PropTypes.func.isRequired,
  isNewApplication: PropTypes.bool.isRequired,
};

const defaultProps = {
  initialPermitGuid: "",
};
export class ApplicationStepOne extends Component {
  state = {
    isImported: false,
    submitting: false,
  };

  componentDidMount() {
    this.setState({ isImported: this.props.noticeOfWork.imported_to_core });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.noticeOfWork.imported_to_core !== nextProps.noticeOfWork.imported_to_core) {
      this.setState({ isImported: nextProps.noticeOfWork.imported_to_core });
    }
  }

  handleNOWImport = (values) => {
    this.setState({ submitting: true });
    const contacts = values.contacts.map((contact) => {
      return {
        mine_party_appt_type_code: contact.mine_party_appt_type_code,
        party_guid: contact.party_guid,
      };
    });
    const payload = {
      ...values,
      contacts,
    };
    return this.props
      .importNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid, payload)
      .then(() => {
        return this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(({ data }) => {
            this.props.loadMineData(values.mine_guid);
            this.props.handleTabChange("application");
            this.setState({ isImported: data.imported_to_core, submitting: false });
          });
      });
  };

  renderContent = () => {
    if (this.props.isNewApplication) {
      return (
        <MajorMinePermitApplicationCreate
          initialPermitGuid={this.props.initialPermitGuid}
          mineGuid={this.props.mineGuid}
          loadNoticeOfWork={this.props.loadNoticeOfWork}
        />
      );
    }
    return (
      <>
        <VerifyApplicationInformationForm
          submitting={this.state.submitting}
          originalNoticeOfWork={this.props.originalNoticeOfWork}
          noticeOfWork={this.props.noticeOfWork}
          mineGuid={this.props.mineGuid}
          onSubmit={this.handleNOWImport}
          initialValues={this.props.originalNoticeOfWork}
        />
      </>
    );
  };

  render() {
    return (
      <div className="tab__content">
        {!this.state.isImported && this.props.mineGuid && this.renderContent()}
        {this.state.isImported && this.props.noticeOfWork.lead_inspector_party_guid && <div />}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      importNoticeOfWorkApplication,
    },
    dispatch
  );

ApplicationStepOne.propTypes = propTypes;
ApplicationStepOne.defaultProps = defaultProps;

export default connect(null, mapDispatchToProps)(ApplicationStepOne);
