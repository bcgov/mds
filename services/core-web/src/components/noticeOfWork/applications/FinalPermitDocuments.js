import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormSection } from "@mds/common/components/forms/form";
import { connect } from "react-redux";
import { getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getNowApplicationDocument } from "@mds/common/utils/permitPackageDocuments";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import withFeatureFlag from "@mds/common/providers/featureFlags/withFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import PermitPackage from "@/components/noticeOfWork/applications/PermitPackage";
import NOWDocuments from "@/components/noticeOfWork/applications/NOWDocuments";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";

export { getNowApplicationDocument };

/**
 * @class FinalPermitDocuments- call logic surrounding adding or removing documents in the final Permit document list
 */

const DECIDED_STATUS_CODES = ["AIA", "WDN", "REJ", "NPR"];

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
  userCanEditPermits: PropTypes.bool.isRequired,
  isFeatureEnabled: PropTypes.func,
};

const defaultProps = {
  adminView: false,
  importNowSubmissionDocumentsJob: {},
  showPreambleFileMetadata: false,
  editPreambleFileMetadata: false,
  disableCategoryFilter: false,
  showInUnifiedView: false,
  showBCMIWarning: false,
  isFeatureEnabled: () => false,
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

    const draftStarted = Boolean(
      this.props.progress.DFT && this.props.progress.DFT.start_date
    );

    const isInCompleteStatus = DECIDED_STATUS_CODES.includes(
      this.props.noticeOfWork.now_application_status_code
    );

    const isNowOrAdministrativeAmendment =
      this.props.noticeOfWork.application_type_code === "NOW" ||
      this.props.noticeOfWork.application_type_code === "ADA";

    const shouldSplitFiguresAndDocuments =
      this.props.isFeatureEnabled(Feature.INSPECTOR_PERMIT_PACKAGE_TYPE_SELECTOR) &&
      !this.props.adminView &&
      draftStarted &&
      !isInCompleteStatus &&
      isNowOrAdministrativeAmendment;

    let unifiedDocumentsView = [];
    if (this.props.showInUnifiedView) {
      const combinedDocuments = (nowApplicationDocument ? [nowApplicationDocument] : [])
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
        );

      const legacyOrderingAllowed =
        !this.props.adminView && draftInProgress && this.props.userCanEditPermits;

      const orderColumnVisibleOutsideSplit = !this.props.adminView && draftStarted;

      const permitPackageRowEditingLocked = !this.props.adminView && !draftInProgress;

      const sharedNOWDocumentsProps = {
        now_application_guid: this.props.noticeOfWork.now_application_guid,
        mine_guid: this.props.mineGuid,
        isViewMode: permitPackageRowEditingLocked,
        disableCategoryFilter: this.props.disableCategoryFilter,
        showPreambleFileMetadata: this.props.showPreambleFileMetadata,
        editPreambleFileMetadata: this.props.editPreambleFileMetadata,
        isFinalPackageTable: true,
        isAdminView: true,
        isSortingAllowed: legacyOrderingAllowed,
        showOrderColumn: orderColumnVisibleOutsideSplit,
      };

      if (shouldSplitFiguresAndDocuments) {
        const isFigureType = (doc) => doc.permit_package_document_type_code === "FIGURE";
        const figuresDocuments = combinedDocuments.filter(isFigureType);
        const documentsOnly = combinedDocuments.filter((doc) => !isFigureType(doc));

        unifiedDocumentsView = (
          <>
            <NOWDocuments
              {...sharedNOWDocumentsProps}
              documents={figuresDocuments}
              documentNumberFormat="whole"
            />
            <NOWDocuments {...sharedNOWDocumentsProps} documents={documentsOnly} />
          </>
        );
      } else {
        unifiedDocumentsView = (
          <NOWDocuments {...sharedNOWDocumentsProps} documents={combinedDocuments} />
        );
      }
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
  userCanEditPermits: userHasRole(Permission.EDIT_PERMITS)(state),
});

FinalPermitDocuments.propTypes = propTypes;
FinalPermitDocuments.defaultProps = defaultProps;

export default connect(mapStateToProps)(withFeatureFlag(FinalPermitDocuments));
