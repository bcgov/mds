import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Prompt, withRouter } from "react-router-dom";
import { formatDate } from "@common/utils/helpers";
import { connect } from "react-redux";
import {
  getNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { generateNoticeOfWorkApplicationDocument } from "@/actionCreators/documentActionCreator";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import PropTypes from "prop-types";
import { reset } from "redux-form";
import { fetchImportedNoticeOfWorkApplication } from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import NOWPermitGeneration from "@/components/noticeOfWork/applications/permitGeneration/NOWPermitGeneration";

const propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      applicationPageFromRoute: CustomPropTypes.applicationPageFromRoute,
    }),
  }).isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  generatableApplicationDocuments: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  generateNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  fixedTop: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  isNoticeOfWorkTypeDisabled: PropTypes.bool,
};

const defaultProps = { isNoticeOfWorkTypeDisabled: true };
export class DraftPermitTab extends Component {
  state = { isViewMode: true, isLoaded: false };

  toggleEditMode = () => {
    this.setState((prevState) => ({
      isViewMode: !prevState.isViewMode,
    }));
  };

  handleResetNOWForm = () => {
    this.props.reset(FORM.EDIT_NOTICE_OF_WORK);
  };

  handleGenerateDocumentFormSubmit = (documentType, values) => {
    const documentTypeCode = documentType.now_application_document_type_code;
    const newValues = values;
    documentType.document_template.form_spec
      .filter((field) => field.type === "DATE")
      .forEach((field) => {
        newValues[field.id] = formatDate(newValues[field.id]);
      });
    const payload = {
      now_application_guid: this.props.noticeOfWork.now_application_guid,
      template_data: newValues,
    };
    return this.props
      .generateNoticeOfWorkApplicationDocument(
        documentTypeCode,
        payload,
        "Successfully created document and attached it to Notice of Work",
        false,
        () => {
          this.setState({ isLoaded: false });
          this.props
            .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
            .then(() => this.setState({ isLoaded: true }));
        }
      )
      .then(() => {
        this.props.closeModal();
      });
  };

  render() {
    const isAmendment = this.props.noticeOfWork.type_of_application !== "New Permit";
    return (
      <React.Fragment>
        <Prompt
          when={!this.state.isViewMode}
          message={(location, action) => {
            const onDraftPermit =
              location.pathname.includes("draft-permit") &&
              this.props.location.pathname.includes("draft-permit");
            // handle user navigating away from technical review/draft permit while in editMode
            if (action === "REPLACE" && !onDraftPermit) {
              this.toggleEditMode();
              this.handleResetNOWForm();
            }
            // if the pathname changes while still on the technicalReview/draftPermit tab (via side navigation), don't prompt user
            return this.props.location.pathname === location.pathname && onDraftPermit
              ? true
              : "You have unsaved changes. Are you sure you want to leave without saving?";
          }}
        />
        <NOWPermitGeneration
          isViewMode={this.state.isViewMode}
          toggleEditMode={this.toggleEditMode}
          fixedTop={this.props.fixedTop}
          noticeOfWork={this.props.noticeOfWork}
          onPermitDraftSave={() =>
            this.props.fetchImportedNoticeOfWorkApplication(
              this.props.noticeOfWork.now_application_guid
            )
          }
          importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
          isAmendment={isAmendment}
          isLoaded={this.state.isLoaded}
          documentType={
            isAmendment
              ? this.props.generatableApplicationDocuments.PMA
              : this.props.generatableApplicationDocuments.PMT
          }
          handleGenerateDocumentFormSubmit={this.handleGenerateDocumentFormSubmit}
          isNoticeOfWorkTypeDisabled={this.props.isNoticeOfWorkTypeDisabled}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  importNowSubmissionDocumentsJob: getImportNowSubmissionDocumentsJob(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchImportedNoticeOfWorkApplication,
      generateNoticeOfWorkApplicationDocument,
      reset,
    },
    dispatch
  );

DraftPermitTab.propTypes = propTypes;
DraftPermitTab.defaultProps = defaultProps;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DraftPermitTab));
