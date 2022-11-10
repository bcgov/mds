import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, notification } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import {
  setNoticeOfWorkApplicationDocumentDownloadState,
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWorkReviews,
  getNoticeOfWork,
  getNOWProgress,
} from "@common/selectors/noticeOfWorkSelectors";
import { getDropdownNoticeOfWorkApplicationReviewTypeOptions } from "@common/selectors/staticContentSelectors";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE_VIOLET, EDIT_OUTLINE } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";

/**
 * @constant PermitPackage renders edit/view for the Permit Package review step
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  setNoticeOfWorkApplicationDocumentDownloadState: PropTypes.func.isRequired,
  isAdminView: PropTypes.bool,
  isTableHeaderView: PropTypes.bool,
};

const defaultProps = {
  isTableHeaderView: false,
  isAdminView: false,
  importNowSubmissionDocumentsJob: {},
};

export class PermitPackage extends Component {
  state = {
    cancelDownload: false,
  };

  createFinalDocumentPackage = (selectedCoreRows, selectedSubmissionRows) => {
    const documentsPayload = this.props.noticeOfWork.documents.map((document) => {
      document.is_final_package = selectedCoreRows.includes(
        document.now_application_document_xref_guid
      );
      return document;
    });

    const submissionDocumentsPayload = this.props.noticeOfWork.filtered_submission_documents.map(
      (document) => {
        document.is_final_package = selectedSubmissionRows.includes(document.mine_document_guid);
        return document;
      }
    );

    const payload = {
      ...this.props.noticeOfWork,
      documents: documentsPayload,
      submission_documents: submissionDocumentsPayload,
    };

    const message = "Successfully updated the permit package.";

    return this.props
      .updateNoticeOfWorkApplication(payload, this.props.noticeOfWork.now_application_guid, message)
      .then(() =>
        this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => this.props.closeModal())
      );
  };

  cancelDownload = () => {
    this.setState({ cancelDownload: true });
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

  waitFor = (conditionFunction) => {
    const poll = (resolve) => {
      if (conditionFunction()) resolve();
      else setTimeout(() => poll(resolve), 400);
    };

    return new Promise(poll);
  };

  downloadDocumentPackage = () => {
    const docURLS = [];

    const submissionDocs = this.props.noticeOfWork.filtered_submission_documents
      .filter(({ is_final_package }) => is_final_package)
      .map((doc) => ({
        key: doc.mine_document_guid,
        documentManagerGuid: doc.document_manager_guid,
        filename: doc.filename,
      }));

    const coreDocs = this.props.noticeOfWork.documents
      .filter(({ is_final_package }) => is_final_package)
      .map((doc) => ({
        key: doc.now_application_document_xref_guid,
        documentManagerGuid: doc.mine_document.document_manager_guid,
        filename: doc.mine_document.document_name,
      }));

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

    let currentFile = 0;
    this.waitFor(() => docURLS.length === submissionDocs.length + coreDocs.length).then(
      async () => {
        // eslint-disable-next-line no-restricted-syntax
        for (const url of docURLS) {
          if (this.state.cancelDownload) {
            this.setState({ cancelDownload: false });
            this.props.setNoticeOfWorkApplicationDocumentDownloadState({
              downloading: false,
              currentFile: 0,
              totalFiles: 1,
            });
            notification.success({
              message: "Cancelled file downloads.",
              duration: 10,
            });
            return;
          }
          currentFile += 1;
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
      }
    );
  };

  openFinalDocumentPackageModal = (event) => {
    event.preventDefault();

    const isNoWApplication = this.props.noticeOfWork.application_type_code === "NOW";

    const finalDocuments = this.props.noticeOfWork.documents
      .filter(({ is_final_package }) => is_final_package)
      .map(({ now_application_document_xref_guid }) => now_application_document_xref_guid);

    const finalSubmissionDocuments = this.props.noticeOfWork.filtered_submission_documents
      .filter(({ is_final_package }) => is_final_package)
      .map(({ mine_document_guid }) => mine_document_guid);

    this.props.openModal({
      props: {
        mineGuid: this.props.noticeOfWork.mine_guid,
        noticeOfWorkGuid: this.props.noticeOfWork.now_application_guid,
        noticeOfWork: this.props.noticeOfWork,
        importNowSubmissionDocumentsJob: this.props.importNowSubmissionDocumentsJob,
        submissionDocuments: this.props.noticeOfWork.filtered_submission_documents,
        documents: this.props.noticeOfWork.documents.filter(({mine_document}) => mine_document?.mine_document_guid),
        finalDocuments,
        finalSubmissionDocuments,
        onSubmit: this.createFinalDocumentPackage,
        title: "Create Final Application Package",
        isNoWApplication,
      },
      content: modalConfig.EDIT_FINAL_PERMIT_DOC_PACKAGE,
      width: "75vw",
    });
  };

  render() {
    return this.props.isTableHeaderView ? (
      <NOWActionWrapper
        permission={Permission.EDIT_PERMITS}
        tab={this.props.isAdminView ? undefined : "REV"}
      >
        <Button ghost type="primary" size="small" onClick={this.openFinalDocumentPackageModal}>
          <img name="remove" src={EDIT_OUTLINE_VIOLET} alt="Edit document" />
        </Button>
      </NOWActionWrapper>
    ) : (
      <div>
        <Button
          type="secondary"
          className="full-mobile"
          onClick={() => this.downloadDocumentPackage()}
        >
          <DownloadOutlined className="padding-sm--right icon-sm" />
          Download All
        </Button>
        <NOWActionWrapper
          permission={Permission.EDIT_PERMITS}
          tab={this.props.isAdminView ? undefined : "REV"}
        >
          <Button
            type="secondary"
            className="full-mobile"
            onClick={this.openFinalDocumentPackageModal}
          >
            <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
            Edit
          </Button>
        </NOWActionWrapper>
      </div>
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
      setNoticeOfWorkApplicationDocumentDownloadState,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

PermitPackage.propTypes = propTypes;
PermitPackage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PermitPackage);
