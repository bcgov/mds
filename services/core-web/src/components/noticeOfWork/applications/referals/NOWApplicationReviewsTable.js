import React from "react";
import { Button, Popconfirm } from "antd";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import { getNoticeOfWorkApplicationApplicationReviewTypeHash } from "@common/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  noticeOfWorkReviewTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  handleDocumentDelete: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  openEditModal: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  categoriesToShow: PropTypes.arrayOf(PropTypes.String).isRequired,
};

const ReviewerLabels = {
  CON: "First Nations Advisor",
  PUB: "Commenter Name",
  REF: "Referral Number",
  ADV: "Uploaded By",
};

const responseDateLabels = {
  CON: "Date Received",
  PUB: "Response Date",
  REF: "Date Received",
  ADV: "Date Published",
};

const columns = (type) => {
  const urlColumn = {
    title: "Link to Record",
    dataIndex: "response_url",
    key: "response_url",
    render: (text) => (
      <div title="Link to Record">
        {text ? (
          <a href={text} target="_blank" rel="noopener noreferrer" alt={text}>
            {truncateFilename(text)}
          </a>
        ) : (
          Strings.EMPTY_FIELD
        )}
      </div>
    ),
  };

  const nameColumn = {
    title: `${ReviewerLabels[type]}`,
    dataIndex: "referee_name",
    key: "referee_name",
    render: (text) => <div title={`${ReviewerLabels[type]}`}>{text || Strings.EMPTY_FIELD}</div>,
  };

  const numberColumn = {
    title: "E-Referral Number",
    dataIndex: "referral_number",
    key: "referral_number",
    render: (text) => <div title="E-Referral Number">{text || Strings.EMPTY_FIELD}</div>,
  };

  const commonColumns = [
    {
      title: type === "ADV" ? "Advertisements" : "Documents",
      dataIndex: "documents",
      key: "documents",
      render: (text) => (
        <div title="Documents">
          {text.length > 0
            ? text.map((doc) =>
                doc && doc.mine_document ? (
                  <li key={doc.mine_document.mine_document_guid}>
                    <div key={doc.mine_document.mine_document_guid}>
                      <DocumentLink
                        documentManagerGuid={doc.mine_document.document_manager_guid}
                        documentName={doc.mine_document.document_name}
                      />
                    </div>
                  </li>
                ) : null
              )
            : Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: `${responseDateLabels[type]}`,
      dataIndex: "response_date",
      key: "response_date",
      render: (text) => <div title="Received Date">{formatDate(text)}</div>,
    },
    {
      title: "",
      dataIndex: "editDeleteButtons",
      key: "editDeleteButtons",
      align: "right",
      render: (text, record) => {
        const correctTab = record.type === "ADV" ? "PUB" : record.type;
        return (
          <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab={correctTab} ignoreDelay>
            <div>
              <Button
                ghost
                type="primary"
                size="small"
                onClick={(event) =>
                  record.openEditModal(
                    event,
                    record,
                    record.handleEdit,
                    record.handleDocumentDelete,
                    record.type,
                    record.categoriesToShow
                  )
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
          </NOWActionWrapper>
        );
      },
    },
  ];

  if (type === "CON") {
    commonColumns.splice(0, 0, urlColumn);
    commonColumns.splice(1, 0, nameColumn);
  } else if (type === "REF") {
    commonColumns.splice(0, 0, numberColumn);
  } else if (type === "PUB") {
    commonColumns.splice(0, 0, nameColumn);
  }

  return commonColumns;
};

const transformRowData = (
  reviews,
  reviewTypeHash,
  handleDelete,
  openEditModal,
  handleEdit,
  handleDocumentDelete,
  type,
  categoriesToShow
) => {
  return reviews.map((review) => ({
    now_application_review_type: reviewTypeHash[review.now_application_review_type_code],
    now_application_document_type_code: review.documents?.now_application_document_type_code,
    handleDelete,
    openEditModal,
    handleEdit,
    handleDocumentDelete,
    type,
    categoriesToShow,
    ...review,
  }));
};

export const NOWApplicationReviewsTable = (props) => {
  const columnValues = columns(props.type);
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
        props.handleDocumentDelete,
        props.type,
        props.categoriesToShow
      )}
    />
  );
};

const mapStateToProps = (state) => ({
  noticeOfWorkReviewTypesHash: getNoticeOfWorkApplicationApplicationReviewTypeHash(state),
});

NOWApplicationReviewsTable.propTypes = propTypes;

export default connect(mapStateToProps)(NOWApplicationReviewsTable);
