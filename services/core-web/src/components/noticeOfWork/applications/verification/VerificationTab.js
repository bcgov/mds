import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  fetchImportedNoticeOfWorkApplication,
  importNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import CustomPropTypes from "@/customPropTypes";
import VerifyApplicationInformationForm from "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  importNoticeOfWorkApplication: PropTypes.func.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
};

const defaultProps = {};
export class VerificationTab extends Component {
  state = {
    isImporting: false,
  };

  handleNOWImport = (values) => {
    this.setState({ isImporting: true });

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
      .then(() =>
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        )
      )
      .finally(() => {
        this.setState({ isImporting: false });
      });
  };

  render() {
    return (
      <div className="tab__content">
        <VerifyApplicationInformationForm
          isImporting={this.state.isImporting}
          originalNoticeOfWork={this.props.originalNoticeOfWork}
          noticeOfWork={this.props.noticeOfWork}
          mineGuid={this.props.mineGuid}
          onSubmit={this.handleNOWImport}
          initialValues={this.props.originalNoticeOfWork}
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchImportedNoticeOfWorkApplication,
      importNoticeOfWorkApplication,
    },
    dispatch
  );

VerificationTab.propTypes = propTypes;
VerificationTab.defaultProps = defaultProps;

export default connect(null, mapDispatchToProps)(VerificationTab);
