import React from "react";
import { Table } from "antd";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import { getNoticeOfWorkApplicationApplicationReviewTypeHash } from "@/selectors/staticContentSelectors";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // eslint-disable-next-line
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  noticeOfWorkReviewTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const columns = [
  {
    title: "Type",
    dataIndex: "now_application_review_type",
    key: "now_application_review_type",
  },
  {
    title: "Response Date",
    dataIndex: "response_date",
    key: "response_date",
  },
  {
    title: "Referee Name",
    dataIndex: "referee_name",
    key: "referee_name",
  },
];

const transformRowData = (reviews, reviewTypeHash) => {
  console.log(reviewTypeHash);
  return reviews.map((review) => ({
    now_application_review_type: reviewTypeHash[review.now_application_review_type_code],
    response_date: review.response_date,
    referee_name: review.referee_name,
  }));
};

export const NOWApplicationReviewsTable = (props) => {
  return (
    <div>
      <Table
        columns={columns}
        pagination={false}
        dataSource={transformRowData(props.noticeOfWorkReviews, props.noticeOfWorkReviewTypesHash)}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  noticeOfWorkReviewTypesHash: getNoticeOfWorkApplicationApplicationReviewTypeHash(state),
});

NOWApplicationReviewsTable.propTypes = propTypes;

export default connect(mapStateToProps)(NOWApplicationReviewsTable);
