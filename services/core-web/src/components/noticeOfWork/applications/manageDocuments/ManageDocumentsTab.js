import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { getDraftPermitAmendmentForNOW } from "@common/selectors/permitSelectors";
import {
  getNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
} from "@common/selectors/noticeOfWorkSelectors";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@common/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import NOWApplicationManageDocuments from "@/components/noticeOfWork/applications/manageDocuments/NOWApplicationManageDocuments";

/**
 * @class ManageDocumentsTab- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fixedTop: PropTypes.bool.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.bool.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  formValues: CustomPropTypes.importedNOWApplication.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
};

export class ManageDocumentsTab extends Component {
  state = {
    isInspectorsLoaded: true,
  };

  handleUpdateInspectors = (values, finalAction) => {
    this.setState({ isInspectorsLoaded: false });
    return this.props
      .updateNoticeOfWorkApplication(
        values,
        this.props.noticeOfWork.now_application_guid,
        "Successfully updated the assigned inspectors"
      )
      .then(() => {
        this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => {
            this.setState({ isInspectorsLoaded: true });
            finalAction();
          });
      });
  };

  handleSaveNOWEdit = () => {
    return this.props
      .updateNoticeOfWorkApplication(
        this.props.formValues,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      });
  };

  render() {
    return (
      <div>
        <NOWTabHeader
          tab="MND"
          tabName="Manage Documents"
          fixedTop={this.props.fixedTop}
          showProgressButton={false}
        />
        <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <NOWSideMenu tabSection="manage-documents" />
        </div>
        <div
          className={
            this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
          }
        >
          <NOWApplicationManageDocuments
            mineGuid={this.props.noticeOfWork.mine_guid}
            noticeOfWork={this.props.noticeOfWork}
            inspectors={this.props.inspectors}
            handleUpdateInspectors={this.handleUpdateInspectors}
            importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
            handleSaveNOWEdit={this.handleSaveNOWEdit}
            isLoaded={this.state.isInspectorsLoaded}
            draftPermitAmendment={this.props.draftPermitAmendment}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  inspectors: getDropdownInspectors(state),
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
  importNowSubmissionDocumentsJob: getImportNowSubmissionDocumentsJob(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

ManageDocumentsTab.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ManageDocumentsTab);
