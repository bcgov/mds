import React from "react";
import { Table, Button, Icon, Popconfirm } from "antd";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import { getNoticeOfWorkApplicationApplicationReviewTypeHash } from "@/selectors/staticContentSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";
/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // eslint-disable-next-line
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  noticeOfWorkReviewTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,

  handleDelete: PropTypes.func.isRequired,
  openEditModal: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
};

const columns = [
  {
    title: "Type",
    dataIndex: "now_application_review_type",
    key: "now_application_review_type",
  },
  {
    title: "Referee Name",
    dataIndex: "referee_name",
    key: "referee_name",
  },
  {
    title: "Response Recieved",
    dataIndex: "response_date",
    key: "response_date",
  },
  {
    title: "Documents",
    dataIndex: "documents",
    key: "documents",
    render: (text, record) => (
      <div title="Documents">
        <ul>
          {text.length > 0 &&
            text.map((doc) => (
              <li key={doc.mine_document.mine_document_guid}>
                <div>
                  <LinkButton
                    key={doc.mine_document.mine_document_guid}
                    onClick={() => downloadFileFromDocumentManager(doc.mine_document)}
                  >
                    {doc.mine_document.document_name}
                  </LinkButton>
                </div>
              </li>
            ))}
        </ul>
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "editDeleteButtons",
    key: "editDeleteButtons",
    align: "right",
    render: (text, record) => (
      <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
        <Button
          ghost
          type="primary"
          size="small"
          onClick={(event) => record.openEditModal(event, record, record.handleEdit)}
        >
          <img src={EDIT_OUTLINE_VIOLET} alt="Edit Review" />
        </Button>
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

const transformRowData = (reviews, reviewTypeHash, handleDelete, openEditModal, handleEdit) => {
  return reviews.map((review) => ({
    now_application_review_type: reviewTypeHash[review.now_application_review_type_code],
    handleDelete,
    openEditModal,
    handleEdit,
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
          props.handleDelete,
          props.openEditModal,
          props.handleEdit
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
