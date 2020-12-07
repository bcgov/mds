import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { openModal, closeModal } from "@common/actions/modalActions";
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
import { getNoticeOfWorkReviews } from "@common/selectors/noticeOfWorkSelectors";
import { getDropdownNoticeOfWorkApplicationReviewTypeOptions } from "@common/selectors/staticContentSelectors";
import Consultation from "@/components/noticeOfWork/applications/referals/Consultation";
import PublicComment from "@/components/noticeOfWork/applications/referals/PublicComment";
import Referral from "@/components/noticeOfWork/applications/referals/Referrals";

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
  deleteNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
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
  PUB: "Commenter Name",
  REF: "Referral Number",
  ADV: "Uploaded By",
};

export class NOWApplicationReviews extends Component {
  state = { isLoaded: false };

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
      .deleteNoticeOfWorkApplicationDocument(
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
      content: modalConfig.NOW_REVIEW,
    });
  };

  render() {
    const commonApplicationReviewProps = {
      isLoaded: this.state.isLoaded,
      noticeOfWorkReviews: this.props.noticeOfWorkReviews,
      noticeOfWorkReviewTypes: this.props.noticeOfWorkReviewTypes,
      handleDelete: this.handleDeleteReview,
      openEditModal: this.openEditReviewModal,
      handleEdit: this.handleEditReview,
      handleDocumentDelete: this.handleDocumentDelete,
      openAddReviewModal: this.openAddReviewModal,
      handleAddReview: this.handleAddReview,
    };

    return (
      <div>
        {this.props.noticeOfWorkReviews && (
          <div>
            {this.props.type === "REF" &&
              this.props.noticeOfWorkReviewTypes.some(
                (reviewType) => reviewType.value === "REF"
              ) && (
                <Referral
                  {...commonApplicationReviewProps}
                  // handleAddReview={(values, type) => this.handleAddReview(values, type)}
                  noticeOfWorkReviews={this.props.noticeOfWorkReviews.filter(
                    (review) => review.now_application_review_type_code === "REF"
                  )}
                />
              )}
            {this.props.type === "FNC" &&
              this.props.noticeOfWorkReviewTypes.some(
                (reviewType) => reviewType.value === "FNC"
              ) && (
                <Consultation
                  {...commonApplicationReviewProps}
                  // handleAddReview={(values, type) => this.handleAddReview(values, type)}
                  noticeOfWorkReviews={this.props.noticeOfWorkReviews.filter(
                    (review) => review.now_application_review_type_code === "FNC"
                  )}
                />
              )}
            {this.props.type === "PUB" &&
              this.props.noticeOfWorkReviewTypes.some(
                (reviewType) => reviewType.value === "PUB" || reviewType.value === "ADV"
              ) && (
                <PublicComment
                  // handleAddReview={(values, type) => this.handleAddReview(values, type)} // no access to adv or pub here
                  {...commonApplicationReviewProps}
                  noticeOfWorkReviews={this.props.noticeOfWorkReviews.filter(
                    (review) => review.now_application_review_type_code === "PUB"
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
      deleteNoticeOfWorkApplicationDocument,
      setNoticeOfWorkApplicationDocumentDownloadState,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

NOWApplicationReviews.propTypes = propTypes;
NOWApplicationReviews.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NOWApplicationReviews);
