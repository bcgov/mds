import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import AddButton from "@/components/common/AddButton";
import NOWApplicationReviewsTable from "@/components/noticeOfWork/applications/referals/NOWApplicationReviewsTable";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";

/**
 * @constant PublicComment renders edit/view for the PublicComment step
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

const defaultProps = {};
const publicCommentCode = "PUB";
const advertisementCode = "ADV";
export const PublicComment = (props) => {
  return (
    <div>
      <ScrollContentWrapper id="advertisements" title="Advertisements">
        <NOWApplicationReviewsTable
          isLoaded={props.isLoaded}
          noticeOfWorkReviews={props.noticeOfWorkReviews.filter(
            (review) => review.now_application_review_type_code === "ADV"
          )}
          noticeOfWorkReviewTypes={props.noticeOfWorkReviewTypes}
          handleDelete={props.handleDelete}
          openEditModal={props.openEditModal}
          handleEdit={props.handleEdit}
          handleDocumentDelete={props.handleDocumentDelete}
          type={advertisementCode}
        />
        <div className="right center-mobile">
          <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab={publicCommentCode}>
            <AddButton
              onClick={(event) =>
                props.openAddReviewModal(event, props.handleAddReview, advertisementCode)
              }
              type="secondary"
            >
              Add Advertisement
            </AddButton>
          </NOWActionWrapper>
        </div>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="public-comment" title="Public Comment">
        <NOWApplicationReviewsTable
          isLoaded={props.isLoaded}
          noticeOfWorkReviews={props.noticeOfWorkReviews.filter(
            (review) => review.now_application_review_type_code === "PUB"
          )}
          noticeOfWorkReviewTypes={props.noticeOfWorkReviewTypes}
          handleDelete={props.handleDelete}
          openEditModal={props.openEditModal}
          handleEdit={props.handleEdit}
          handleDocumentDelete={props.handleDocumentDelete}
          type={publicCommentCode}
        />
        <div className="right center-mobile">
          <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab={publicCommentCode}>
            <AddButton
              onClick={(event) =>
                props.openAddReviewModal(event, props.handleAddReview, publicCommentCode)
              }
              type="secondary"
            >
              Add Public Comment
            </AddButton>
          </NOWActionWrapper>
        </div>
      </ScrollContentWrapper>
    </div>
  );
};

PublicComment.propTypes = propTypes;
PublicComment.defaultProps = defaultProps;

export default PublicComment;
