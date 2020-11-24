/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, Row, Col, notification, Badge, Tag, Popconfirm } from "antd";
import { DownloadOutlined, InfoCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { formatDate } from "@common/utils/helpers";

import { openModal, closeModal } from "@common/actions/modalActions";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import AddButton from "@/components/common/AddButton";
import {
  createNoticeOfWorkApplicationReview,
  fetchNoticeOfWorkApplicationReviews,
  deleteNoticeOfWorkApplicationReview,
  updateNoticeOfWorkApplicationReview,
  deleteNoticeOfWorkApplicationReviewDocument,
  setNoticeOfWorkApplicationDocumentDownloadState,
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWorkReviews } from "@common/selectors/noticeOfWorkSelectors";
import { getDropdownNoticeOfWorkApplicationReviewTypeOptions } from "@common/selectors/staticContentSelectors";
import NOWApplicationReviewsTable from "@/components/noticeOfWork/applications/referals/NOWApplicationReviewsTable";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  noticeOfWorkReviewTypes: CustomPropTypes.options.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createNoticeOfWorkApplicationReview: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationReviews: PropTypes.func.isRequired,
  updateNoticeOfWorkApplicationReview: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationReview: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationReviewDocument: PropTypes.func.isRequired,
  setNoticeOfWorkApplicationDocumentDownloadState: PropTypes.func.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  type: PropTypes.func.isRequired,
};

const defaultProps = {
  importNowSubmissionDocumentsJob: {},
};

const ReviewerLabels = {
  FNC: "First Nations Advisor",
  PUB: "Uploaded By",
  REF: "Referee Name",
};

const ApplicationReview = (props) => (
  <div className="padding-large--bottom">
    <ScrollContentWrapper id={props.reviewType.label} title={props.reviewType.label}>
      <NOWApplicationReviewsTable
        isLoaded={props.isLoaded}
        noticeOfWorkReviews={props.noticeOfWorkReviews.filter(
          (review) => review.now_application_review_type_code === props.reviewType.value
        )}
        noticeOfWorkReviewTypes={props.noticeOfWorkReviewTypes}
        handleDelete={props.handleDelete}
        openEditModal={props.openEditModal}
        handleEdit={props.handleEdit}
        handleDocumentDelete={props.handleDocumentDelete}
        reviewerLabel={ReviewerLabels[props.reviewType.value]}
        type={props.reviewType.value}
      />
    </ScrollContentWrapper>
  </div>
);

export class NOWApplicationReviews extends Component {
  state = { cancelDownload: false, isLoaded: false };

  componentDidMount() {
    this.props
      .fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWork.now_application_guid)
      .then(() => this.setState({ isLoaded: true }));
  }

  handleAddReview = (values) => {
    this.props
      .createNoticeOfWorkApplicationReview(this.props.noticeOfWork.now_application_guid, values)
      .then(() => {
        this.props.fetchNoticeOfWorkApplicationReviews(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });
  };

  handleEditReview = (values) => {
    const { now_application_review_id } = values;
    const formValues = {
      uploadedFiles: values.uploadedFiles,
      now_application_review_type_code: values.now_application_review_type_code,
      response_date: values.response_date,
      referee_name: values.referee_name,
    };
    this.props
      .updateNoticeOfWorkApplicationReview(
        this.props.noticeOfWork.now_application_guid,
        now_application_review_id,
        formValues
      )
      .then(() => {
        this.props.fetchNoticeOfWorkApplicationReviews(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });
  };

  handleDocumentDelete = (mine_document) => {
    this.props
      .deleteNoticeOfWorkApplicationReviewDocument(
        this.props.noticeOfWork.now_application_guid,
        mine_document
      )
      .then(() => {
        this.props.fetchNoticeOfWorkApplicationReviews(
          this.props.noticeOfWork.now_application_guid
        );
      });
  };

  handleDeleteReview = (now_application_review_id) => {
    this.props
      .deleteNoticeOfWorkApplicationReview(
        this.props.noticeOfWork.now_application_guid,
        now_application_review_id
      )
      .then(() => {
        this.props.fetchNoticeOfWorkApplicationReviews(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });
  };

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

  openAddReviewModal = (event, onSubmit) => {
    event.preventDefault();
    const initialValues = {
      now_application_guid: this.props.noticeOfWork.now_application_guid,
      now_application_review_type_code: this.props.type,
    };
    this.props.openModal({
      props: {
        initialValues,
        onSubmit,
        title: "Add Reviewer to Application",
        reviewTypes: this.props.noticeOfWorkReviewTypes,
        reviewerLabels: ReviewerLabels,
      },
      isViewOnly: true,
      content: modalConfig.NOW_REVIEW,
    });
  };

  openEditReviewModal = (event, initialValues, onSubmit, handleDocumentDelete) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues,
        onSubmit,
        handleDocumentDelete,
        title: "Edit Review",
        reviewTypes: this.props.noticeOfWorkReviewTypes,
        reviewerLabels: ReviewerLabels,
      },
      isViewOnly: true,
      content: modalConfig.NOW_REVIEW,
    });
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

    let currentFile = 0;
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

      if (!this.props.noticeOfWork.ready_for_review_date) {
        this.updateNoticeOfWork({
          ...this.props.noticeOfWork,
          ready_for_review_date: new Date(),
        });
      }

      this.props.closeModal();
      this.props.setNoticeOfWorkApplicationDocumentDownloadState({
        downloading: false,
        currentFile: 1,
        totalFiles: 1,
      });
    });
  };

  openDownloadPackageModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      width: 910,
      props: {
        noticeOfWorkGuid: this.props.noticeOfWork.now_application_guid,
        submissionDocuments: this.props.noticeOfWork.filtered_submission_documents,
        importNowSubmissionDocumentsJob: this.props.importNowSubmissionDocumentsJob,
        coreDocuments: this.props.noticeOfWork.documents,
        onSubmit: this.downloadDocumentPackage,
        cancelDownload: this.cancelDownload,
        title: "Download Referral Package",
      },
      content: modalConfig.DOWNLOAD_DOC_PACKAGE,
    });
  };

  updateNoticeOfWork = (updatedNow) => {
    const id = this.props.noticeOfWork.now_application_guid;
    this.props
      .updateNoticeOfWorkApplication(updatedNow, this.props.noticeOfWork.now_application_guid)
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(id);
      });
  };

  render() {
    const commonApplicationReviewProps = {
      isLoaded: this.state.isLoaded,
      noticeOfWorkReviews: this.props.noticeOfWorkReviews,
      noticeOfWorkReviewTypes: this.props.noticeOfWorkReviewTypes,
      importNowSubmissionDocumentsJob: this.props.importNowSubmissionDocumentsJob,
      handleDelete: this.handleDeleteReview,
      openEditModal: this.openEditReviewModal,
      handleEdit: this.handleEditReview,
      handleDocumentDelete: this.handleDocumentDelete,
    };

    return (
      <div>
        <Row type="flex" justify="center">
          <Col lg={24} className="padding-large--top">
            <div className="right center-mobile">
              <Button
                type="secondary"
                className="full-mobile"
                onClick={this.openDownloadPackageModal}
              >
                <DownloadOutlined className="padding-small--right icon-sm" />
                Download Referral Package
              </Button>
              <NOWActionWrapper
                permission={Permission.EDIT_PERMITS}
                tab={this.props.type === "FNC" ? "CON" : this.props.type}
              >
                <AddButton
                  onClick={(event) => this.openAddReviewModal(event, this.handleAddReview)}
                >
                  Add Review
                </AddButton>
              </NOWActionWrapper>
            </div>
          </Col>
        </Row>
        {this.props.noticeOfWorkReviews && (
          <div className="page__content">
            {this.props.type === "REF" &&
              this.props.noticeOfWorkReviewTypes.some(
                (reviewType) => reviewType.value === "REF"
              ) && (
                <ApplicationReview
                  {...commonApplicationReviewProps}
                  reviewType={this.props.noticeOfWorkReviewTypes.find(
                    (reviewType) => reviewType.value === "REF"
                  )}
                />
              )}
            {this.props.type === "FNC" &&
              this.props.noticeOfWorkReviewTypes.some(
                (reviewType) => reviewType.value === "FNC"
              ) && (
                <ApplicationReview
                  {...commonApplicationReviewProps}
                  reviewType={this.props.noticeOfWorkReviewTypes.find(
                    (reviewType) => reviewType.value === "FNC"
                  )}
                />
              )}
            {this.props.type === "PUB" &&
              this.props.noticeOfWorkReviewTypes.some(
                (reviewType) => reviewType.value === "PUB"
              ) && (
                <ApplicationReview
                  {...commonApplicationReviewProps}
                  reviewType={this.props.noticeOfWorkReviewTypes.find(
                    (reviewType) => reviewType.value === "PUB"
                  )}
                />
              )}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWorkReviews: getNoticeOfWorkReviews(state),
  noticeOfWorkReviewTypes: getDropdownNoticeOfWorkApplicationReviewTypeOptions(state),
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
      deleteNoticeOfWorkApplicationReviewDocument,
      setNoticeOfWorkApplicationDocumentDownloadState,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

NOWApplicationReviews.propTypes = propTypes;
NOWApplicationReviews.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NOWApplicationReviews);
