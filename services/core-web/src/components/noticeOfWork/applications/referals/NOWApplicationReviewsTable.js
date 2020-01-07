import React from "react";
import { Table } from "antd";
import { PropTypes } from "prop-types";
import CustomPropTypes from "@/customPropTypes";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // eslint-disable-next-line
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
};

const columns = [
  {
    title: "Type",
    dataIndex: "now_application_review_type_code",
    key: "now_application_review_type_code",
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

const transformRowData = (reviews) => {
  console.log(reviews);
  return reviews;
};

export const NOWApplicationReviewsTable = (props) => {
  return (
    <div>
      <Table columns={columns} dataSource={transformRowData(props.noticeOfWorkReviews)} />
    </div>
  );
};

NOWApplicationReviewsTable.propTypes = propTypes;

export default NOWApplicationReviewsTable;
