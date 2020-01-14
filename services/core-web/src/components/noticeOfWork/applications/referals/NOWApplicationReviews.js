import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, Row, Col, notification } from "antd";
import { openModal, closeModal } from "@/actions/modalActions";
import {
  getNowDocumentDownloadToken,
  getDocumentDownloadToken,
} from "@/utils/actionlessNetworkCalls";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import AddButton from "@/components/common/AddButton";
import {
  createNoticeOfWorkApplicationReview,
  fetchNoticeOfWorkApplicationReviews,
  deleteNoticeOfWorkApplicationReview,
  updateNoticeOfWorkApplicationReview,
  deleteNoticeOfWorkApplicationReviewDocument,
  setNoticeOfWorkApplicationDocumentDownloadState,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { fetchNoticeOfWorkApplicationReviewTypes } from "@/actionCreators/staticContentActionCreator";
import { getNoticeOfWorkReviews } from "@/selectors/noticeOfWorkSelectors";
import { getDropdownNoticeOfWorkApplicationReviewTypeOptions } from "@/selectors/staticContentSelectors";
import NOWApplicationReviewsTable from "@/components/noticeOfWork/applications/referals/NOWApplicationReviewsTable";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // eslint-disable-next-line
  noticeOfWorkGuid: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  // eslint-disable-next-line
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  coreDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  submissionDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  noticeOfWorkReviewTypes: CustomPropTypes.options.isRequired,

  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createNoticeOfWorkApplicationReview: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationReviews: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationReviewTypes: PropTypes.func.isRequired,
  updateNoticeOfWorkApplicationReview: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationReview: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationReviewDocument: PropTypes.func.isRequired,
  setNoticeOfWorkApplicationDocumentDownloadState: PropTypes.func.isRequired,
};

const defaultProps = {};

export class NOWApplicationReviews extends Component {
  state = { cancelDownload: false };
  componentDidMount() {
    this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWorkGuid);
    this.props.fetchNoticeOfWorkApplicationReviewTypes();
  }

  handleAddReview = (values) => {
    this.props.createNoticeOfWorkApplicationReview(this.props.noticeOfWorkGuid, values).then(() => {
      this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWorkGuid);
      this.props.closeModal();
    });
  };

  handleEditReview = (values) => {
    const { now_application_review_id } = values;
    const form_values = {
      uploadedFiles: values.uploadedFiles,
      now_application_review_type_code: values.now_application_review_type_code,
      response_date: values.response_date,
      referee_name: values.referee_name,
    };
    this.props
      .updateNoticeOfWorkApplicationReview(
        this.props.noticeOfWorkGuid,
        now_application_review_id,
        form_values
      )
      .then(() => {
        this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWorkGuid);
        this.props.closeModal();
      });
  };

  handleDocumentDelete = (mine_document) => {
    this.props
      .deleteNoticeOfWorkApplicationReviewDocument(this.props.noticeOfWorkGuid, mine_document)
      .then(() => {
        this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWorkGuid);
      });
  };

  handleDeleteReview = (now_application_review_id) => {
    this.props
      .deleteNoticeOfWorkApplicationReview(this.props.noticeOfWorkGuid, now_application_review_id)
      .then(() => {
        this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWorkGuid);
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
    const initialValues = { now_application_guid: this.props.noticeOfWorkGuid };
    this.props.openModal({
      props: {
        initialValues,
        onSubmit,
        title: "Add Review to Permit Application",
        review_types: this.props.noticeOfWorkReviewTypes,
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
        review_types: this.props.noticeOfWorkReviewTypes,
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
    const submissionDocs = this.props.submissionDocuments
      .map((document) => ({
        key: document.id,
        filename: document.filename,
      }))
      .filter((item) => selectedSubmissionRows.includes(item.key));
    const coreDocs = this.props.coreDocuments
      .map((document) => ({
        key: document.now_application_document_xref_guid,
        documentManagerGuid: document.mine_document.document_manager_guid,
        filename: document.mine_document.document_name,
      }))
      .filter((item) => selectedCoreRows.includes(item.key));

    let currentFile = 1;
    const totalFiles = submissionDocs.length + coreDocs.length;
    if (totalFiles === 0) return;

    submissionDocs.forEach((doc) =>
      getNowDocumentDownloadToken(doc.key, this.props.noticeOfWorkGuid, doc.filename, docURLS)
    );
    coreDocs.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    this.waitFor(() => docURLS.length === submissionDocs.length + coreDocs.length).then(
      async () => {
        // eslint-disable-next-line
        for (const url of docURLS) {
          if (this.state.cancelDownload) {
            this.setState({ cancelDownload: false });
            this.props.closeModal();
            this.props.setNoticeOfWorkApplicationDocumentDownloadState({
              downloading: false,
              currentFile: 1,
              totalFiles: 1,
            });
            notification.success({
              message: `Cancelled file downloads.`,
              duration: 10,
            });
            return;
          }
          currentFile = currentFile + 1;
          this.props.setNoticeOfWorkApplicationDocumentDownloadState({
            downloading: true,
            currentFile: currentFile,
            totalFiles: totalFiles,
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
          downloading: false,
          currentFile: 1,
          totalFiles: 1,
        });
      }
    );
  };

  openDownloadPackageModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        mineGuid: this.props.mineGuid,
        noticeOfWorkGuid: this.props.noticeOfWorkGuid,
        submissionDocuments: this.props.submissionDocuments,
        coreDocuments: this.props.coreDocuments,
        onSubmit: this.downloadDocumentPackage,
        cancelDownload: this.cancelDownload,
        title: `Download Files`,
      },
      // widthSize: "50vw",
      content: modalConfig.DOWNLOAD_DOC_PACKAGE,
    });
  };

  render() {
    return (
      <div>
        <Row type="flex" justify="center">
          <Col sm={22} md={22} lg={22} className="padding-xxl--top">
            <div className="inline-flex flex-end">
              <Button
                type="secondary"
                className="full-mobile"
                onClick={this.openDownloadPackageModal}
              >
                Download Referral Package
              </Button>
              <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                <AddButton
                  onClick={(event) => this.openAddReviewModal(event, this.handleAddReview)}
                >
                  Add Review
                </AddButton>
              </AuthorizationWrapper>
            </div>
          </Col>
        </Row>

        <Row type="flex" justify="center">
          <Col sm={22} md={22} lg={22}>
            {this.props.noticeOfWorkReviews && (
              <NOWApplicationReviewsTable
                noticeOfWorkReviews={this.props.noticeOfWorkReviews}
                noticeOfWorkReviewTypes={this.props.noticeOfWorkReviewTypes}
                handleDelete={this.handleDeleteReview}
                openEditModal={this.openEditReviewModal}
                handleEdit={this.handleEditReview}
                handleDocumentDelete={this.handleDocumentDelete}
              />
            )}
          </Col>
        </Row>
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
      fetchNoticeOfWorkApplicationReviewTypes,
      deleteNoticeOfWorkApplicationReview,
      updateNoticeOfWorkApplicationReview,
      deleteNoticeOfWorkApplicationReviewDocument,
      setNoticeOfWorkApplicationDocumentDownloadState,
    },
    dispatch
  );

NOWApplicationReviews.propTypes = propTypes;
NOWApplicationReviews.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NOWApplicationReviews);
