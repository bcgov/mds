import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormSection } from "@mds/common/components/forms/form";
import { connect } from "react-redux";
import { getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getLockedSystemNtrDoc } from "@mds/common/utils/helpers";
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
  showBCMIWarning: PropTypes.bool,
};

const defaultProps = {
  adminView: false,
  importNowSubmissionDocumentsJob: {},
  showPreambleFileMetadata: false,
  editPreambleFileMetadata: false,
  disableCategoryFilter: false,
  showInUnifiedView: false,
  showBCMIWarning: false,
};

const LOCKED_ROW_BASE = {
  final_package_order: -1,
  isLockedApplicationForm: true,
  now_application_document_type_code: null,
  is_final_package: true,
  is_referral_package: false,
  is_consultation_package: false,
};

const NA_ROW = {
  ...LOCKED_ROW_BASE,
  now_application_document_xref_guid: "application-form-1.1", // synthetic key — no real NTR doc exists yet
  preamble_title: "N/A",
  preamble_author: "N/A",
  preamble_date: null,
  category: "N/A",
  description: "N/A",
  mine_document: {
    mine_document_guid: null,
    document_manager_guid: null,
    document_name: null,
    upload_date: null,
  },
};

const TECHNICAL_REVIEW_NTR_DESCRIPTION =
  "This document was automatically created when Technical Review was completed.";

export const getNowApplicationDocument = (noticeOfWork, progress) => {
  const nullResult = { nowApplicationDocument: null, lockedNtrGuid: null };

  if (noticeOfWork.application_type_code !== "NOW") {
    return nullResult;
  }

  const hasSystemGeneratedNtr = noticeOfWork.documents.some(
    (doc) => doc.now_application_document_type_code === "NTR" && doc.is_system_generated
  );
  if (!hasSystemGeneratedNtr) {
    return nullResult;
  }

  const technicalReviewEverCompleted =
    !!progress.REV?.end_date ||
    noticeOfWork.documents.some(
      (doc) =>
        doc.now_application_document_type_code === "NTR" &&
        doc.is_system_generated &&
        doc.description === TECHNICAL_REVIEW_NTR_DESCRIPTION
    );
  if (!technicalReviewEverCompleted) {
    return nullResult;
  }

  const latestNtr = getLockedSystemNtrDoc(noticeOfWork.documents, noticeOfWork.locked_ntr_guid);
  if (!latestNtr) {
    return { nowApplicationDocument: NA_ROW, lockedNtrGuid: null };
  }

  return {
    lockedNtrGuid: latestNtr.now_application_document_xref_guid,
    nowApplicationDocument: {
      ...latestNtr,
      ...LOCKED_ROW_BASE,
      preamble_title: latestNtr.preamble_title || "Notice of Work Application",
      preamble_author: latestNtr.preamble_author || "N/A",
      preamble_date: latestNtr.preamble_date ?? latestNtr.mine_document?.upload_date ?? null,
      category: "Notice of Work Form",
      description:
        "Latest version of the Notice of Work application. Always included and system-managed.",
    },
  };
};

export class FinalPermitDocuments extends Component {
  render() {
    const { nowApplicationDocument, lockedNtrGuid } = getNowApplicationDocument(
      this.props.noticeOfWork,
      this.props.progress
    );

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
          documents={
            (nowApplicationDocument ? [nowApplicationDocument] : [])
              .concat(
                permitDocuments.filter(
                  (doc) => !lockedNtrGuid || doc.now_application_document_xref_guid !== lockedNtrGuid
                )
              )
              .concat(
                (permitSubmissionDocuments || [])
                  .map((doc) => ({
                    ...doc,
                    now_application_document_type_code: doc.documenttype,
                    now_application_document_sub_type_code: doc.documenttype,
                    mine_document: {
                      document_manager_guid: doc.document_manager_guid,
                      document_name: doc.filename,
                      mine_document_guid: doc.mine_document_guid,
                      mine_guid: this.props.noticeOfWork.mine_guid,
                    },
                  }))
              )
          }
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
          <div style={{ width: "75%" }}>
            {!this.props.adminView && <h4>Permit Package</h4>}
            <p>All files in this list will appear in the Preamble on the permit.</p>
            <br />
            {this.props?.showBCMIWarning &&
              <p>
                <b>Warning</b>: Files uploaded here will be visible to the proponent and may be publicly posted on external websites
                including BC Mines Information Website without further review. Please ensure all attachments comply with
                FOIPPA (Freedom of Information and Protection of Privacy Act) requirements and do not include personal or sensitive information.
              </p>
            }
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
