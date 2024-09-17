import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import AddButton from "@/components/common/buttons/AddButton";
import NOWApplicationReviewsTable from "@/components/noticeOfWork/applications/referals/NOWApplicationReviewsTable";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import { CONSULTATION_TAB_CODE } from "@/constants/NOWConditions";

/**
 * @constant Consultation renders edit/view for the Consultation step
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

const categoriesToShow = ["CDO"];
export const Consultation = (props) => {
  return (
    <div>
      <ScrollContentWrapper id="consultation" title="Consultation">
        <NOWApplicationReviewsTable
          isLoaded={props.isLoaded}
          noticeOfWorkReviews={props.noticeOfWorkReviews}
          noticeOfWorkReviewTypes={props.noticeOfWorkReviewTypes}
          handleDelete={props.handleDelete}
          openEditModal={props.openEditModal}
          handleEdit={props.handleEdit}
          handleDocumentDelete={props.handleDocumentDelete}
          type={CONSULTATION_TAB_CODE}
          categoriesToShow={categoriesToShow}
        />
        <div className="right center-mobile">
          <NOWActionWrapper
            permission={Permission.EDIT_PERMITS}
            tab={CONSULTATION_TAB_CODE}
            ignoreDelay
          >
            <AddButton
              onClick={(event) =>
                props.openAddReviewModal(
                  event,
                  props.handleAddReview,
                  CONSULTATION_TAB_CODE,
                  categoriesToShow
                )
              }
              type="secondary"
            >
              Add Consultation
            </AddButton>
          </NOWActionWrapper>
        </div>
      </ScrollContentWrapper>
    </div>
  );
};

Consultation.propTypes = propTypes;

export default Consultation;
