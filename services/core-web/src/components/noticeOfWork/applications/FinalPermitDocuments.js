import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormSection } from "redux-form";
import { connect } from "react-redux";
import { getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import CustomPropTypes from "@/customPropTypes";
import PermitPackage from "@/components/noticeOfWork/applications/PermitPackage";
import NOWDocuments from "@/components/noticeOfWork/applications/NOWDocuments";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";

/**
 * @class FinalPermitDocuments- call logic surrounding adding or removing documents in the final Permit document list
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  adminView: PropTypes.bool,
  showPreambleFileMetadata: PropTypes.bool,
  editPreambleFileMetadata: PropTypes.bool,
  disableCategoryFilter: PropTypes.bool,
  showInUnifiedView: PropTypes.bool,
};

const defaultProps = {
  adminView: false,
  importNowSubmissionDocumentsJob: {},
  showPreambleFileMetadata: false,
  editPreambleFileMetadata: false,
  disableCategoryFilter: false,
  showInUnifiedView: false,
};

export class FinalPermitDocuments extends Component {
  render() {
    const permitDocuments = this.props.noticeOfWork.documents.filter(
      ({ is_final_package }) => is_final_package
    );

    const permitSubmissionDocuments =
      this.props.noticeOfWork.filtered_submission_documents &&
      this.props.noticeOfWork.filtered_submission_documents.filter(
        ({ is_final_package }) => is_final_package
      );

    const nowSubmissionDocuments = (
      <NOWSubmissionDocuments
        now_application_guid={this.props.noticeOfWork.now_application_guid}
        mine_guid={this.props.mineGuid}
        documents={permitSubmissionDocuments}
        importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
        hideImportStatusColumn
        hideJobStatusColumn
        showPreambleFileMetadata={this.props.showPreambleFileMetadata}
        editPreambleFileMetadata={this.props.editPreambleFileMetadata}
        isFinalPackageTable
        isViewMode
        isAdminView={this.props.adminView}
      />
    );

    const nowDocuments = (
      <NOWDocuments
        now_application_guid={this.props.noticeOfWork.now_application_guid}
        mine_guid={this.props.mineGuid}
        documents={permitDocuments}
        isViewMode
        showPreambleFileMetadata={this.props.showPreambleFileMetadata}
        editPreambleFileMetadata={this.props.editPreambleFileMetadata}
        isFinalPackageTable
        isAdminView={this.props.adminView}
      />
    );

    const draftInProgress =
      this.props.progress.DFT &&
      this.props.progress.DFT.start_date &&
      !this.props.progress.DFT.end_date;

    let unifiedDocumentsView = [];
    if (this.props.showInUnifiedView) {
      unifiedDocumentsView = (
        <NOWDocuments
          now_application_guid={this.props.noticeOfWork.now_application_guid}
          mine_guid={this.props.mineGuid}
          documents={permitDocuments.concat(
            permitSubmissionDocuments.map((doc) => {
              return {
                ...doc,
                now_application_document_type_code: doc.documenttype,
                now_application_document_sub_type_code: doc.documenttype,
                mine_document: {
                  document_manager_guid: doc.document_manager_guid,
                  document_name: doc.filename,
                  mine_document_guid: doc.mine_document_guid,
                  mine_guid: this.props.noticeOfWork.mine_guid,
                },
              };
            })
          )}
          isViewMode
          disableCategoryFilter={this.props.disableCategoryFilter}
          showPreambleFileMetadata={this.props.showPreambleFileMetadata}
          editPreambleFileMetadata={this.props.editPreambleFileMetadata}
          isFinalPackageTable
          isAdminView
          isSortingAllowed={!this.props.adminView && draftInProgress}
        />
      );
    }

    return (
      <div>
        <div className="inline-flex between">
          <div>
            {!this.props.adminView && <h4>Permit Package</h4>}
            <p>All files in this list will appear in the Preamble on the permit.</p>
          </div>
          <div>
            <PermitPackage isAdminView={this.props.adminView} />
          </div>
        </div>
        {(this.props.showPreambleFileMetadata && this.props.showInUnifiedView && (
          <FormSection name="final_requested_documents_metadata">
            {unifiedDocumentsView}
          </FormSection>
        )) ||
          unifiedDocumentsView}
        {!this.props.showInUnifiedView && (
          <>
            <h4>Original Documents</h4>
            <p>These documents came in with the original application.</p>
            {(this.props.showPreambleFileMetadata && (
              <FormSection name="final_original_documents_metadata">
                {nowSubmissionDocuments}
              </FormSection>
            )) ||
              nowSubmissionDocuments}
            <br />

            <h4>Requested Documents</h4>
            <p>
              These documents were added after the original application but were provided by the
              proponent.
            </p>
            {(this.props.showPreambleFileMetadata && (
              <FormSection name="final_requested_documents_metadata">{nowDocuments}</FormSection>
            )) ||
              nowDocuments}
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  progress: getNOWProgress(state),
});

FinalPermitDocuments.propTypes = propTypes;
FinalPermitDocuments.defaultProps = defaultProps;

export default connect(mapStateToProps)(FinalPermitDocuments);
