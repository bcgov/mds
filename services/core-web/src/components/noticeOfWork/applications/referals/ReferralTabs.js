import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ExportOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import {
  createNoticeOfWorkApplicationReview,
  fetchNoticeOfWorkApplicationReviews,
  deleteNoticeOfWorkApplicationReview,
  updateNoticeOfWorkApplicationReview,
  deleteNoticeOfWorkApplicationDocument,
  setNoticeOfWorkApplicationDocumentDownloadState,
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
  getNoticeOfWorkReviews,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  getDropdownNoticeOfWorkApplicationReviewTypeOptions,
  getNoticeOfWorkApplicationApplicationReviewTypeHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import Consultation from "@/components/noticeOfWork/applications/referals/Consultation";
import PublicComment from "@/components/noticeOfWork/applications/referals/PublicComment";
import Referral from "@/components/noticeOfWork/applications/referals/Referrals";
import {
  CONSULTATION_REVIEW_CODE,
  REFERRAL_CODE,
  PUBLIC_COMMENT,
  CONSULTATION_TAB_CODE,
  ADVERTISEMENT,
  ADVERTISEMENT_DOC,
} from "@/constants/NOWConditions";
import ReferralConsultationPackage from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";

/**
 * @constant ReferralTabs renders Referral/Consultation/PublicComment review logic
 */

const propTypes = {
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
  type: PropTypes.string.isRequired,
  noticeOfWorkReviewTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fixedTop: PropTypes.bool.isRequired,
};

const defaultProps = {
  importNowSubmissionDocumentsJob: {},
};

export class ReferralTabs extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props
      .fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWork.now_application_guid)
      .then(() => this.setState({ isLoaded: true }));
  }

  handleAddReview = (values) => {
    return this.props
      .createNoticeOfWorkApplicationReview(this.props.noticeOfWork.now_application_guid, values)
      .then(() => {
        this.props.fetchNoticeOfWorkApplicationReviews(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });
  };

  handleEditReview = (values) => {
    const { now_application_review_id, now_application_review_type_code } = values;
    const correctType =
      now_application_review_type_code === CONSULTATION_TAB_CODE
        ? CONSULTATION_REVIEW_CODE
        : now_application_review_type_code;
    const formValues = {
      uploadedFiles: values.uploadedFiles,
      now_application_review_type_code: correctType,
      response_date: values.response_date,
      referee_name: values.referee_name,
      referral_number: values.referral_number,
      now_application_document_type_code: values.now_application_document_type_code,
      response_url: values.response_url,
    };
    return this.props
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

  openAddReviewModal = (event, onSubmit, type, categoriesToShow) => {
    event.preventDefault();
    const initialValues = {
      now_application_guid: this.props.noticeOfWork.now_application_guid,
      now_application_review_type_code:
        type === CONSULTATION_TAB_CODE ? CONSULTATION_REVIEW_CODE : type,
      now_application_document_type_code: type === ADVERTISEMENT ? ADVERTISEMENT_DOC : null,
      response_url: type === CONSULTATION_TAB_CODE ? "https://" : null,
    };
    this.props.openModal({
      props: {
        initialValues,
        onSubmit,
        reviewTypes: this.props.noticeOfWorkReviewTypes,
        type,
        categoriesToShow,
        title:
          type === CONSULTATION_TAB_CODE
            ? `Add ${this.props.noticeOfWorkReviewTypesHash[CONSULTATION_REVIEW_CODE]}`
            : `Add ${this.props.noticeOfWorkReviewTypesHash[type]}`,
      },
      content: modalConfig.NOW_REVIEW,
    });
  };

  openEditReviewModal = (
    event,
    initialValues,
    onSubmit,
    handleDocumentDelete,
    type,
    categoriesToShow
  ) => {
    const newInitialValues = {
      ...initialValues,
      now_application_document_type_code: type === ADVERTISEMENT ? ADVERTISEMENT_DOC : null,
    };
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: newInitialValues,
        onSubmit,
        handleDocumentDelete,
        title:
          type === CONSULTATION_TAB_CODE
            ? `Edit ${this.props.noticeOfWorkReviewTypesHash[CONSULTATION_REVIEW_CODE]}`
            : `Edit ${this.props.noticeOfWorkReviewTypesHash[type]}`,
        reviewTypes: this.props.noticeOfWorkReviewTypes,
        type,
        categoriesToShow,
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
            {this.props.type === REFERRAL_CODE && (
              <>
                <NOWTabHeader
                  tab="REF"
                  tabActions={<ReferralConsultationPackage type="REF" />}
                  tabName="Referral"
                  fixedTop={this.props.fixedTop}
                  noticeOfWork={this.props.noticeOfWork}
                />
                <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
                  <NOWSideMenu tabSection="referral" />
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={Strings.E_REFERRALS_URL}
                    alt="E-Referrals"
                  >
                    <ExportOutlined className="padding-small--right" />
                    Link to E-referrals homepage
                  </a>
                </div>
                <div
                  className={
                    this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
                  }
                >
                  <Referral
                    {...commonApplicationReviewProps}
                    noticeOfWorkReviews={this.props.noticeOfWorkReviews.filter(
                      (review) => review.now_application_review_type_code === REFERRAL_CODE
                    )}
                  />
                </div>
              </>
            )}
            {this.props.type === CONSULTATION_REVIEW_CODE && (
              <>
                <NOWTabHeader
                  tab="CON"
                  tabActions={<ReferralConsultationPackage type="CON" />}
                  tabName="Consultation"
                  fixedTop={this.props.fixedTop}
                  noticeOfWork={this.props.noticeOfWork}
                />
                <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
                  <NOWSideMenu tabSection="consultation" />
                </div>
                <div
                  className={
                    this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
                  }
                >
                  <Consultation
                    {...commonApplicationReviewProps}
                    noticeOfWorkReviews={this.props.noticeOfWorkReviews.filter(
                      (review) =>
                        review.now_application_review_type_code === CONSULTATION_REVIEW_CODE
                    )}
                  />
                </div>
              </>
            )}
            {this.props.type === PUBLIC_COMMENT && (
              <>
                <NOWTabHeader
                  tab="PUB"
                  tabName="Public Comment"
                  fixedTop={this.props.fixedTop}
                  noticeOfWork={this.props.noticeOfWork}
                />
                <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
                  <NOWSideMenu tabSection="public-comment" />
                </div>
                <div
                  className={
                    this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
                  }
                >
                  <PublicComment
                    {...commonApplicationReviewProps}
                    noticeOfWorkReviews={this.props.noticeOfWorkReviews}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWorkReviews: getNoticeOfWorkReviews(state),
  noticeOfWork: getNoticeOfWork(state),
  importNowSubmissionDocumentsJob: getImportNowSubmissionDocumentsJob(state),
  noticeOfWorkReviewTypes: getDropdownNoticeOfWorkApplicationReviewTypeOptions(state),
  noticeOfWorkReviewTypesHash: getNoticeOfWorkApplicationApplicationReviewTypeHash(state),
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

ReferralTabs.propTypes = propTypes;
ReferralTabs.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ReferralTabs);
