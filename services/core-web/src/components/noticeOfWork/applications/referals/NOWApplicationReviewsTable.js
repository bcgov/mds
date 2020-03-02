import React from "react";
import { Button, Popconfirm } from "antd";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { getNoticeOfWorkApplicationApplicationReviewTypeHash } from "@common/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@/components/common/CoreTable";
import NullScreen from "@/components/common/NullScreen";

const propTypes = {
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  noticeOfWorkReviewTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  handleDocumentDelete: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  openEditModal: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  reviewerLabel: PropTypes.string.isRequired,
};

const columns = (reviewerLabel) => [
  {
    title: "Type",
    dataIndex: "now_application_review_type",
    key: "now_application_review_type",
    render: (text) => <div title="Type">{text}</div>,
  },
  {
    title: reviewerLabel,
    dataIndex: "referee_name",
    key: "referee_name",
    render: (text) => <div title="Type">{text}</div>,
  },
  {
    title: "Response Received",
    dataIndex: "response_date",
    key: "response_date",
    render: (text) => <div title="Type">{text}</div>,
  },
  {
    title: "Documents",
    dataIndex: "documents",
    key: "documents",
    render: (text) => (
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
        <div>
          <Button
            ghost
            type="primary"
            size="small"
            onClick={(event) =>
              record.openEditModal(event, record, record.handleEdit, record.handleDocumentDelete)
            }
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
            <Button ghost size="small">
              <img name="remove" src={TRASHCAN} alt="Remove Activity" />
            </Button>
          </Popconfirm>
        </div>
      </AuthorizationWrapper>
    ),
  },
];

const transformRowData = (
  reviews,
  reviewTypeHash,
  handleDelete,
  openEditModal,
  handleEdit,
  handleDocumentDelete
) => {
  return reviews.map((review) => ({
    now_application_review_type: reviewTypeHash[review.now_application_review_type_code],
    handleDelete,
    openEditModal,
    handleEdit,
    handleDocumentDelete,
    ...review,
  }));
};

export const NOWApplicationReviewsTable = (props) => {
  const columnValues = columns(props.reviewerLabel);
  return (
    <CoreTable
      condition={props.isLoaded}
      columns={columnValues}
      dataSource={transformRowData(
        props.noticeOfWorkReviews,
        props.noticeOfWorkReviewTypesHash,
        props.handleDelete,
        props.openEditModal,
        props.handleEdit,
        props.handleDocumentDelete
      )}
      tableProps={{
        pagination: false,
        locale: { emptyText: <NullScreen type="no-results" /> },
      }}
    />
  );
};

const mapStateToProps = (state) => ({
  noticeOfWorkReviewTypesHash: getNoticeOfWorkApplicationApplicationReviewTypeHash(state),
});

NOWApplicationReviewsTable.propTypes = propTypes;

export default connect(mapStateToProps)(NOWApplicationReviewsTable);
