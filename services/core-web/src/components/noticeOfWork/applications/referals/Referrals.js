import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import AddButton from "@/components/common/buttons/AddButton";
import NOWApplicationReviewsTable from "@/components/noticeOfWork/applications/referals/NOWApplicationReviewsTable";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";

/**
 * @constant Referral renders edit/view for the Referral step
 */

const propTypes = {
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  noticeOfWorkReviewTypes: CustomPropTypes.options.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  handleDelete: PropTypes.func.isRequired,
  openEditModal: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDocumentDelete: PropTypes.func.isRequired,
  openAddReviewModal: PropTypes.func.isRequired,
  handleAddReview: PropTypes.func.isRequired,
};

const referralCode = "REF";
const categoriesToShow = ["RDO"];
export const Referral = (props) => {
  return (
    <div>
      <ScrollContentWrapper id="referral" title="Referral">
        <NOWApplicationReviewsTable
          isLoaded={props.isLoaded}
          noticeOfWorkReviews={props.noticeOfWorkReviews}
          noticeOfWorkReviewTypes={props.noticeOfWorkReviewTypes}
          handleDelete={props.handleDelete}
          openEditModal={props.openEditModal}
          handleEdit={props.handleEdit}
          handleDocumentDelete={props.handleDocumentDelete}
          type={referralCode}
          categoriesToShow={categoriesToShow}
        />
      </ScrollContentWrapper>
      <div className="right center-mobile">
        <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab={referralCode} ignoreDelay>
          <AddButton
            onClick={(event) =>
              props.openAddReviewModal(event, props.handleAddReview, referralCode, categoriesToShow)
            }
            type="secondary"
          >
            Add Referral
          </AddButton>
        </NOWActionWrapper>
      </div>
    </div>
  );
};

Referral.propTypes = propTypes;

export default Referral;
