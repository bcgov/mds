import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button } from "antd";
import { openModal, closeModal } from "@/actions/modalActions";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import AddButton from "@/components/common/AddButton";
import {
  createNoticeOfWorkApplicationReview,
  fetchNoticeOfWorkApplicationReviews,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWorkReviews } from "@/selectors/noticeOfWorkSelectors";
import NOWApplicationReviewsTable from "@/components/noticeOfWork/applications/referals/NOWApplicationReviewsTable";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // eslint-disable-next-line
  noticeOfWorkGuid: PropTypes.string.isRequired,
  // eslint-disable-next-line
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  applicationDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  submissionDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createNoticeOfWorkApplicationReview: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationReviews: PropTypes.func.isRequired,
};

const defaultProps = {};

export class NOWApplicationReviews extends Component {
  state = {};

  openDownloadPackageModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        noticeOfWorkGuid: this.props.noticeOfWorkGuid,
        submissionDocuments: this.props.submissionDocuments,
        onSubmit: () => {
          true;
        },
        title: `Download Files`,
      },
      // widthSize: "50vw",
      content: modalConfig.DOWNLOAD_DOC_PACKAGE,
    });
  };

  componentDidMount() {
    this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWorkGuid);
  }

  // eslint-disable-next-line
  handleAddReview = (values) => {
    this.props.createNoticeOfWorkApplicationReview(this.props.noticeOfWorkGuid, values).then(() => {
      this.props.closeModal();
    });
  };

  // eslint-disable-next-line
  openAddReviewModal = (event, onSubmit, noticeOfWorkGuid) => {
    this.props.openModal({
      props: {
        title: "Add Review to Permit Application",
      },
      isViewOnly: true,
      content: modalConfig.ADD_NOW_REVIEW,
    });
  };

  render() {
    return (
      <div>
        <Button type="secondary" className="full-mobile" onClick={this.openDownloadPackageModal}>
          Download Referral Package
        </Button>
        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
          <AddButton
            onClick={(event) => this.openMineIncidentModal(event, this.handleAddMineIncident, true)}
          >
            Add Review
          </AddButton>
        </AuthorizationWrapper>
        {this.props.noticeOfWorkReviews && (
          <NOWApplicationReviewsTable noticeOfWorkReviews={this.props.noticeOfWorkReviews} />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWorkReviews: getNoticeOfWorkReviews(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      fetchNoticeOfWorkApplicationReviews,
      createNoticeOfWorkApplicationReview,
    },
    dispatch
  );

NOWApplicationReviews.propTypes = propTypes;
NOWApplicationReviews.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NOWApplicationReviews);
