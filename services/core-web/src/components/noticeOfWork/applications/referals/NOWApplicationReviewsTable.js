import React from "react";
import { Table, Button, Icon, Popconfirm } from "antd";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import { getNoticeOfWorkApplicationApplicationReviewTypeHash } from "@/selectors/staticContentSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // eslint-disable-next-line
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  noticeOfWorkReviewTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,

  handleDelete: PropTypes.func.isRequired,
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
  {
    title: "",
    dataIndex: "editDeleteButtons",
    key: "editDeleteButtons",
    align: "right",
    render: (text, record) => (
      <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
        <Popconfirm
          placement="topLeft"
          title="Are you sure you want to delete this?"
          onConfirm={() => record.handleDelete(record.now_application_review_id)}
          okText="Delete"
          cancelText="Cancel"
        >
          <Button ghost type="primary" size="small">
            <Icon type="minus-circle" theme="outlined" />
          </Button>
        </Popconfirm>
      </AuthorizationWrapper>
    ),
  },
];

const transformRowData = (reviews, reviewTypeHash, handleDelete) => {
  return reviews.map((review) => ({
    now_application_review_type: reviewTypeHash[review.now_application_review_type_code],
    handleDelete,
    ...review,
  }));
};

export const NOWApplicationReviewsTable = (props) => {
  return (
    <div>
      <Table
        columns={columns}
        pagination={false}
        dataSource={transformRowData(
          props.noticeOfWorkReviews,
          props.noticeOfWorkReviewTypesHash,
          props.handleDelete
        )}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  noticeOfWorkReviewTypesHash: getNoticeOfWorkApplicationApplicationReviewTypeHash(state),
});

NOWApplicationReviewsTable.propTypes = propTypes;

export default connect(mapStateToProps)(NOWApplicationReviewsTable);
