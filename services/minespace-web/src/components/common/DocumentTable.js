import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Table } from "antd";
import { formatDate, formatDateTime, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
  documentParent: PropTypes.string.isRequired,
  categoryDataIndex: PropTypes.string.isRequired,
  uploadDateIndex: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  documents: [],
};

export const DocumentTable = (props) => {
  const columns = [
    {
      title: "File Name",
      dataIndex: "document_name",
      render: (text, record) => {
        return (
          <div title="File Name">
            <LinkButton title={text} onClick={() => downloadFileFromDocumentManager(record)}>
              {truncateFilename(text)}
            </LinkButton>
          </div>
        );
      },
    },
    {
      title: "Category",
      dataIndex: props.categoryDataIndex,
      render: (text) => <div title="Category">{props.documentCategoryOptionsHash[text]}</div>,
    },
  ];

  const uploadDateColumn = {
    title: "Upload Date",
    dataIndex: props.uploadDateIndex,
    render: (text) => <div title="Upload Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
  };

  const uploadDateTimeColumn = {
    title: "Date/Time",
    dataIndex: props.uploadDateIndex,
    sorter: (a, b) => (moment(a.uploadDateIndex) > moment(b.uploadDateIndex) ? -1 : 1),
    render: (text) => <div title="Date/Time">{formatDateTime(text) || Strings.EMPTY_FIELD}</div>,
  };

  const importedByColumn = {
    title: "Imported By",
    dataIndex: "create_user",
    render: (text) => (text ? <div title="User">{text}</div> : null),
  };

  if (props.documentParent === "Information Requirements Table") {
    columns.push(uploadDateTimeColumn);
    columns.push(importedByColumn);
  } else {
    columns.push(uploadDateColumn);
  }

  return (
    <div>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        rowKey={(record) => record.mine_document_guid}
        locale={{ emptyText: `This ${props.documentParent} does not contain any documents.` }}
        dataSource={props.documents}
      />
    </div>
  );
};

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
