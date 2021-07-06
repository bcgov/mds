import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { FormSection } from "redux-form";
import { connect } from "react-redux";
import { Button, Progress } from "antd";
import { getDocumentDownloadState } from "@common/selectors/noticeOfWorkSelectors";
import { COLOR } from "@/constants/styles";
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
  documentDownloadState: CustomPropTypes.documentDownloadState.isRequired,
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
  state = {
    cancelDownload: false,
  };

  cancelDownload = () => {
    this.setState({ cancelDownload: true });
  };

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
          isAdminView={this.props.adminView}
        />
      );
    }

    const isNoWApplication = this.props.noticeOfWork.application_type_code === "NOW";

    return this.props.documentDownloadState.downloading ? (
      <div className="inline-flex flex-flow-column horizontal-center">
        <h4>Downloading Selected Files...</h4>
        <Progress
          className="padding-md--top padding-lg--bottom"
          strokeColor={COLOR.violet}
          type="circle"
          percent={Math.round(
            (this.props.documentDownloadState.currentFile /
              this.props.documentDownloadState.totalFiles) *
              100
          )}
        />
        <Button className="full-mobile" type="secondary" onClick={() => this.cancelDownload()}>
          Cancel
        </Button>
      </div>
    ) : (
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
        {isNoWApplication && (
          <>
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
                  <FormSection name="final_requested_documents_metadata">
                    {nowDocuments}
                  </FormSection>
                )) ||
                  nowDocuments}
              </>
            )}
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  documentDownloadState: getDocumentDownloadState(state),
});

FinalPermitDocuments.propTypes = propTypes;
FinalPermitDocuments.defaultProps = defaultProps;

export default connect(mapStateToProps)(FinalPermitDocuments);
