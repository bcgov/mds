import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { Button, notification } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
  fetchNoticeOfWorkApplicationReviews,
  setNoticeOfWorkApplicationDocumentDownloadState,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
  getNoticeOfWorkReviews,
} from "@common/selectors/noticeOfWorkSelectors";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@common/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { modalConfig } from "@/components/modalContent/config";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import NOWApplicationManageDocuments from "@/components/noticeOfWork/applications/manageDocuments/NOWApplicationManageDocuments";
import { waitFor, downloadDocument } from "@/components/common/downloads/helpers";

/**
 * @class ManageDocumentsTab- contains all information relating to the documents on a Notice of Work Application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationReviews: PropTypes.func.isRequired,
  fixedTop: PropTypes.bool.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.bool.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  formValues: CustomPropTypes.importedNOWApplication.isRequired,
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  setNoticeOfWorkApplicationDocumentDownloadState: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class ManageDocumentsTab extends Component {
  state = {
    isInspectorsLoaded: true,
    cancelDownload: false,
  };

  componentDidMount = () =>
    this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWork.now_application_guid);

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

  cancelDownload = () => {
    this.setState({ cancelDownload: true });
  };

  gatherNowDocuments = () => {
    // Extract documents from NoW Reviews(generated) and add to NoW Submissions(uploaded)
    const nowDocs = this.props.noticeOfWork.documents;
    const nowReviewDocs = [];
    this.props.noticeOfWorkReviews.forEach((review) => {
      if (review.documents.length) {
        nowReviewDocs.push(...review.documents);
      }
    });
    return [...nowDocs, ...nowReviewDocs];
  };

  downloadDocumentPackage = (selectedDocumentRows) => {
    const docURLS = [];

    const nowDocs = this.gatherNowDocuments()
      .map((doc) => ({
        key: doc.mine_document.mine_document_guid,
        documentManagerGuid: doc.mine_document.document_manager_guid,
        filename: doc.mine_document.document_name,
      }))
      .filter((doc) => selectedDocumentRows.includes(doc.key));

    const totalFiles = nowDocs.length;
    if (totalFiles === 0) {
      return;
    }

    nowDocs.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    let currentFile = 0;
    waitFor(() => docURLS.length === totalFiles).then(async () => {
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
          downloadDocument(url);
          // eslint-disable-next-line
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        currentFile += 1;
        this.props.setNoticeOfWorkApplicationDocumentDownloadState({
          downloading: true,
          currentFile,
          totalFiles,
        });
        downloadDocument(url);
        // eslint-disable-next-line
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      // dispatch toast message
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

    this.props.openModal({
      props: {
        noticeOfWorkGuid: this.props.noticeOfWork.now_application_guid,
        nowDocuments: this.gatherNowDocuments(),
        onSubmit: this.downloadDocumentPackage,
        cancelDownload: this.cancelDownload,
        title: "Download NoW Documents",
        closeModal: this.props.closeModal,
        afterClose: () => {},
      },
      content: modalConfig.NOW_MANAGE_DOCUMENTS_DOWNLOAD_PACKAGE_MODAL,
      width: "75vw",
    });
  };

  render() {
    return (
      <div>
        <NOWTabHeader
          tab="MND"
          tabName="Manage Documents"
          fixedTop={this.props.fixedTop}
          noticeOfWork={this.props.noticeOfWork}
          showProgressButton={false}
          tabActions={
            <Button
              type="secondary"
              className="full-mobile"
              onClick={this.openDownloadPackageModal}
            >
              Download Documents
            </Button>
          }
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
            importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
            handleSaveNOWEdit={this.handleSaveNOWEdit}
            isLoaded={this.state.isInspectorsLoaded}
            noticeOfWorkReviews={this.props.noticeOfWorkReviews}
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
  noticeOfWorkReviews: getNoticeOfWorkReviews(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchNoticeOfWorkApplicationReviews,
      setNoticeOfWorkApplicationDocumentDownloadState,
    },
    dispatch
  );

ManageDocumentsTab.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ManageDocumentsTab);
