import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, notification } from "antd";

import { openModal, closeModal } from "@common/actions/modalActions";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import {
  createNoticeOfWorkApplicationReview,
  fetchNoticeOfWorkApplicationReviews,
  deleteNoticeOfWorkApplicationReview,
  updateNoticeOfWorkApplicationReview,
  deleteNoticeOfWorkApplicationDocument,
  setNoticeOfWorkApplicationDocumentDownloadState,
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWorkReviews,
  getNoticeOfWork,
  getNOWProgress,
} from "@common/selectors/noticeOfWorkSelectors";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import { getDropdownNoticeOfWorkApplicationReviewTypeOptions } from "@common/selectors/staticContentSelectors";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import { isEmpty, isNil } from "lodash";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  setNoticeOfWorkApplicationDocumentDownloadState: PropTypes.func.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  isTableHeaderView: PropTypes.bool,
};

const defaultProps = {
  importNowSubmissionDocumentsJob: {},
  isTableHeaderView: false,
};

export class ReferralConsultationPackage extends Component {
  state = { cancelDownload: false };

  waitFor = (conditionFunction) => {
    const poll = (resolve) => {
      if (conditionFunction()) resolve();
      else setTimeout(() => poll(resolve), 400);
    };

    return new Promise(poll);
  };

  downloadDocument = (url) => {
    const a = document.createElement("a");
    a.href = url.url;
    a.download = url.filename;
    a.style.display = "none";
    document.body.append(a);
    a.click();
    a.remove();
  };

  cancelDownload = () => {
    this.setState({ cancelDownload: true });
  };

  downloadDocumentPackage = (selectedCoreRows, selectedSubmissionRows) => {
    const docURLS = [];

    const submissionDocs = this.props.noticeOfWork.filtered_submission_documents
      .map((doc) => ({
        key: doc.mine_document_guid,
        documentManagerGuid: doc.document_manager_guid,
        filename: doc.filename,
      }))
      .filter((doc) => selectedSubmissionRows.includes(doc.key));

    const coreDocs = this.props.noticeOfWork.documents
      .map((doc) => ({
        key: doc.now_application_document_xref_guid,
        documentManagerGuid: doc.mine_document.document_manager_guid,
        filename: doc.mine_document.document_name,
      }))
      .filter((doc) => selectedCoreRows.includes(doc.key));

    const totalFiles = submissionDocs.length + coreDocs.length;
    if (totalFiles === 0) {
      return;
    }

    submissionDocs.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    coreDocs.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    const currentFile = 0;
    this.waitFor(() => docURLS.length === totalFiles).then(async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const url of docURLS) {
        if (this.state.cancelDownload) {
          this.setState({ cancelDownload: false });
          this.props.closeModal();
          this.props.setNoticeOfWorkApplicationDocumentDownloadState({
            downloading: false,
            currentFile: 0,
            totalFiles: 1,
          });
          this.downloadDocument(url);
          // eslint-disable-next-line
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        // dispatch toast message
        notification.success({
          message: `Successfully Downloaded: ${submissionDocs.length + coreDocs.length} files.`,
          duration: 10,
        });

        this.props.closeModal();
        this.props.setNoticeOfWorkApplicationDocumentDownloadState({
          downloading: true,
          currentFile,
          totalFiles,
        });
        this.downloadDocument(url);
        // eslint-disable-next-line
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      notification.success({
        message: `Successfully Downloaded: ${totalFiles} files.`,
        duration: 10,
      });

      this.props.setNoticeOfWorkApplicationDocumentDownloadState({
        downloading: false,
        currentFile: 1,
        totalFiles: 1,
      });
      this.props.closeModal();
    });
  };

  openDownloadPackageModal = (event) => {
    event.preventDefault();
    const column = this.props.type === "REF" ? "is_referral_package" : "is_consultation_package";
    const coreDocumentsInPackage = this.props.noticeOfWork.documents
      .filter((document) => document[column])
      .map(({ now_application_document_xref_guid }) => now_application_document_xref_guid);

    const submissionDocumentsInPackage = this.props.noticeOfWork.filtered_submission_documents
      .filter((document) => document[column])
      .map(({ mine_document_guid }) => mine_document_guid);

    const isNoWApplication = this.props.noticeOfWork.application_type_code === "NOW";

    this.props.openModal({
      props: {
        noticeOfWorkGuid: this.props.noticeOfWork.now_application_guid,
        noticeOfWork: this.props.noticeOfWork,
        importNowSubmissionDocumentsJob: this.props.importNowSubmissionDocumentsJob,
        coreDocuments: this.props.noticeOfWork.documents,
        onSubmit: this.downloadDocumentPackage,
        cancelDownload: this.cancelDownload,
        title: "Download Referral Package",
        submissionDocumentsInPackage,
        coreDocumentsInPackage,
        handleSavePackage: this.handleSavePackage,
        type: this.props.type,
        isNoWApplication,
      },
      content: modalConfig.DOWNLOAD_DOC_PACKAGE,
      width: "75vw",
    });
  };

  handleSavePackage = (selectedCoreRows, selectedSubmissionRows) => {
    const column = this.props.type === "REF" ? "is_referral_package" : "is_consultation_package";
    const documentsPayload = this.props.noticeOfWork.documents.map((document) => {
      document[column] = selectedCoreRows.includes(document.now_application_document_xref_guid);
      return document;
    });

    const submissionDocumentsPayload = this.props.noticeOfWork.filtered_submission_documents.map(
      (document) => {
        document[column] = selectedSubmissionRows.includes(document.mine_document_guid);
        return document;
      }
    );

    const payload = {
      ...this.props.noticeOfWork,
      documents: documentsPayload,
      submission_documents: submissionDocumentsPayload,
    };

    const message =
      this.props.type === "REF"
        ? "Successfully updated the Referral Package."
        : "Successfully updated the Consultation Package.";

    return this.props
      .updateNoticeOfWorkApplication(payload, this.props.noticeOfWork.now_application_guid, message)
      .then(() => {
        this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => {
            this.props.closeModal();
          });
      });
  };

  render() {
    const label = this.props.type === "REF" ? "Referral Package" : "Consultation Package";
    const complete =
      !isEmpty(this.props.progress[this.props.type]) &&
      !isNil(this.props.progress[this.props.type].end_date);

    const disabled = complete;

    return this.props.isTableHeaderView ? (
      <NOWActionWrapper
        permission={Permission.EDIT_PERMITS}
        tab={this.props.type}
        isDisabledReviewButton
      >
        <Button ghost type="primary" size="small" onClick={this.openDownloadPackageModal}>
          <img name="remove" src={EDIT_OUTLINE_VIOLET} alt={label} />
        </Button>
      </NOWActionWrapper>
    ) : (
      <Button
        type="secondary"
        className="full-mobile"
        onClick={this.openDownloadPackageModal}
        disabled={disabled}
      >
        {label}
      </Button>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  noticeOfWorkReviews: getNoticeOfWorkReviews(state),
  noticeOfWorkReviewTypes: getDropdownNoticeOfWorkApplicationReviewTypeOptions(state),
  progress: getNOWProgress(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      fetchNoticeOfWorkApplicationReviews,
      createNoticeOfWorkApplicationReview,
      deleteNoticeOfWorkApplicationReview,
      updateNoticeOfWorkApplicationReview,
      deleteNoticeOfWorkApplicationDocument,
      setNoticeOfWorkApplicationDocumentDownloadState,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

ReferralConsultationPackage.propTypes = propTypes;
ReferralConsultationPackage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ReferralConsultationPackage);
