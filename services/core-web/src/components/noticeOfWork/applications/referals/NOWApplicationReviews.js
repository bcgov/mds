import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { PropTypes } from "prop-types";
import { Button } from "antd";
import { openModal, closeModal } from "@/actions/modalActions";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // eslint-disable-next-line
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  // eslint-disable-next-line
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.importedNOWApplicationReview).isRequired,
  nowApplicationGuid: PropTypes.string.isRequired,
  applicationDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  submissionDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {};

export class NOWApplicationReviews extends Component {
  state = {};

  openDownloadPackageModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        nowApplicationGuid: this.props.nowApplicationGuid,
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

  render() {
    return (
      <Button type="secondary" className="full-mobile" onClick={this.openDownloadPackageModal}>
        Download Referral Package
      </Button>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
    },
    dispatch
  );

NOWApplicationReviews.propTypes = propTypes;
NOWApplicationReviews.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NOWApplicationReviews);
