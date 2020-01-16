import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, Row, Col, notification, Divider, Badge, Icon, Tag } from "antd";
import { formatDate } from "@/utils/helpers";

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
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { fetchNoticeOfWorkApplicationReviewTypes } from "@/actionCreators/staticContentActionCreator";
import { getNoticeOfWorkReviews } from "@/selectors/noticeOfWorkSelectors";
import { getDropdownNoticeOfWorkApplicationReviewTypeOptions } from "@/selectors/staticContentSelectors";
import NOWApplicationReviewsTable from "@/components/noticeOfWork/applications/referals/NOWApplicationReviewsTable";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
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
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
};

const defaultProps = {};

const ApplicationReview = (props) => (
  <Row type="flex" justify="center">
    <Col sm={22} md={22} lg={22} className="padding-large--bottom">
      <div className="padding-large--bottom">
        <h3>{props.reviewType.label}</h3>
        {!props.readyForReview && <Badge status="default" text="Not started" />}
        {props.readyForReview && !props.completeDate && (
          <Badge status="processing" text="In progress" />
        )}
        {props.readyForReview && props.completeDate && (
          <Badge status="success" text={`Completed on ${formatDate(props.completeDate)}`} />
        )}
      </div>
      <NOWApplicationReviewsTable
        noticeOfWorkReviews={props.noticeOfWorkReviews.filter(
          (review) => review.now_application_review_type_code === props.reviewType.value
        )}
        noticeOfWorkReviewTypes={props.noticeOfWorkReviewTypes}
        handleDelete={props.handleDeleteReview}
        openEditModal={props.openEditReviewModal}
        handleEdit={props.handleEditReview}
        handleDocumentDelete={props.handleDocumentDelete}
      />
      {props.readyForReview && !props.completeDate && (
        <div className="inline-flex flex-end">
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <Button
              onClick={(event) => props.completeHandler(event, props.reviewType.value)}
              type="primary"
            >
              {`Set ${props.reviewType.label} as Completed`}
            </Button>
          </AuthorizationWrapper>
        </div>
      )}
      <Divider />
    </Col>
  </Row>
);

export class NOWApplicationReviews extends Component {
  state = { cancelDownload: false };

  componentDidMount() {
    this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWork.now_application_guid);
    this.props.fetchNoticeOfWorkApplicationReviewTypes();
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
    const form_values = {
      uploadedFiles: values.uploadedFiles,
      now_application_review_type_code: values.now_application_review_type_code,
      response_date: values.response_date,
      referee_name: values.referee_name,
    };
    this.props
      .updateNoticeOfWorkApplicationReview(
        this.props.noticeOfWork.now_application_guid,
        now_application_review_id,
        form_values
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
    const initialValues = { now_application_guid: this.props.noticeOfWork.now_application_guid };
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
    const submissionDocs = this.props.noticeOfWork.submission_documents
      .map((document) => ({
        key: document.id,
        filename: document.filename,
      }))
      .filter((item) => selectedSubmissionRows.includes(item.key));
    const coreDocs = this.props.noticeOfWork.documents
      .map((document) => ({
        key: document.now_application_document_xref_guid,
        documentManagerGuid: document.mine_document.document_manager_guid,
        filename: document.mine_document.document_name,
      }))
      .filter((item) => selectedCoreRows.includes(item.key));

    let currentFile = 0;
    const totalFiles = submissionDocs.length + coreDocs.length;
    if (totalFiles === 0) return;

    submissionDocs.forEach((doc) =>
      getNowDocumentDownloadToken(
        doc.key,
        this.props.noticeOfWork.now_application_guid,
        doc.filename,
        docURLS
      )
    );
    coreDocs.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    this.waitFor(() => docURLS.length === submissionDocs.length + coreDocs.length).then(
      async () => {
        for (const url of docURLS) {
          if (this.state.cancelDownload) {
            this.setState({ cancelDownload: false });
            this.props.closeModal();
            this.props.setNoticeOfWorkApplicationDocumentDownloadState({
              downloading: false,
              currentFile: 0,
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
            currentFile,
            totalFiles,
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
      }
    );
  };

  openDownloadPackageModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        mineGuid: this.props.mineGuid,
        noticeOfWorkGuid: this.props.noticeOfWork.now_application_guid,
        submissionDocuments: this.props.noticeOfWork.submission_documents,
        coreDocuments: this.props.noticeOfWork.documents,
        onSubmit: this.downloadDocumentPackage,
        cancelDownload: this.cancelDownload,
        title: `Download Referral Package`,
      },
      // widthSize: "50vw",
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
    return (
      <div>
        <Row type="flex" justify="center">
          <Col sm={22} md={22} lg={22} className="padding-large--top">
            <div className="inline-flex between">
              <div>
                {!this.props.noticeOfWork.ready_for_review_date && (
                  <Tag className="ant-disabled">
                    <Icon type="info-circle" className="padding-small--right" />
                    Referral package not downloaded
                  </Tag>
                )}
                {this.props.noticeOfWork.ready_for_review_date && (
                  <Tag className="ant-disabled">
                    <Icon type="clock-circle" className="padding-small--right" />
                    {`Reviews started on ${formatDate(
                      this.props.noticeOfWork.ready_for_review_date
                    )}`}
                  </Tag>
                )}
              </div>
              <div>
                <Button
                  type="secondary"
                  className="full-mobile"
                  onClick={this.openDownloadPackageModal}
                >
                  <Icon type="download" theme="outlined" className="padding-small--right icon-sm" />
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
            </div>
          </Col>
        </Row>
        {this.props.noticeOfWorkReviews && (
          <React.Fragment>
            {this.props.noticeOfWorkReviewTypes.some(
              (reviewType) => reviewType.value === "REF"
            ) && (
              <ApplicationReview
                reviewType={this.props.noticeOfWorkReviewTypes.find(
                  (reviewType) => reviewType.value === "REF"
                )}
                readyForReview={this.props.noticeOfWork.ready_for_review_date}
                completeDate={this.props.noticeOfWork.referral_closed_on_date}
                completeHandler={() =>
                  this.updateNoticeOfWork({
                    ...this.props.noticeOfWork,
                    referral_closed_on_date: new Date(),
                  })
                }
                noticeOfWorkReviews={this.props.noticeOfWorkReviews}
                noticeOfWorkReviewTypes={this.props.noticeOfWorkReviewTypes}
                handleDelete={this.handleDeleteReview}
                openEditModal={this.openEditReviewModal}
                handleEdit={this.handleEditReview}
                handleDocumentDelete={this.handleDocumentDelete}
              />
            )}
            {this.props.noticeOfWorkReviewTypes.some(
              (reviewType) => reviewType.value === "FNC"
            ) && (
              <ApplicationReview
                reviewType={this.props.noticeOfWorkReviewTypes.find(
                  (reviewType) => reviewType.value === "FNC"
                )}
                readyForReview={this.props.noticeOfWork.ready_for_review_date}
                completeDate={this.props.noticeOfWork.consultation_closed_on_date}
                completeHandler={() =>
                  this.updateNoticeOfWork({
                    ...this.props.noticeOfWork,
                    consultation_closed_on_date: new Date(),
                  })
                }
                noticeOfWorkReviews={this.props.noticeOfWorkReviews}
                noticeOfWorkReviewTypes={this.props.noticeOfWorkReviewTypes}
                handleDelete={this.handleDeleteReview}
                openEditModal={this.openEditReviewModal}
                handleEdit={this.handleEditReview}
                handleDocumentDelete={this.handleDocumentDelete}
              />
            )}
            {this.props.noticeOfWorkReviewTypes.some(
              (reviewType) => reviewType.value === "PUB"
            ) && (
              <ApplicationReview
                reviewType={this.props.noticeOfWorkReviewTypes.find(
                  (reviewType) => reviewType.value === "PUB"
                )}
                readyForReview={this.props.noticeOfWork.ready_for_review_date}
                completeDate={this.props.noticeOfWork.public_comment_closed_on_date}
                completeHandler={() =>
                  this.updateNoticeOfWork({
                    ...this.props.noticeOfWork,
                    public_comment_closed_on_date: new Date(),
                  })
                }
                noticeOfWorkReviews={this.props.noticeOfWorkReviews}
                noticeOfWorkReviewTypes={this.props.noticeOfWorkReviewTypes}
                handleDelete={this.handleDeleteReview}
                openEditModal={this.openEditReviewModal}
                handleEdit={this.handleEditReview}
                handleDocumentDelete={this.handleDocumentDelete}
              />
            )}
          </React.Fragment>
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
      fetchNoticeOfWorkApplicationReviewTypes,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NOWApplicationReviews);
