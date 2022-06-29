import React from "react";
import PropTypes from "prop-types";
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
    {
      title: "Upload Date",
      dataIndex: props.uploadDateIndex,
      render: (text) => (
        <div title="Upload Date">
          {props.documentParent === "Information Requirements Table"
            ? formatDateTime(text)
            : formatDate(text) || Strings.EMPTY_FIELD}
        </div>
      ),
    },
  ];

  const userColumn = {
    title: "User",
    dataIndex: "create_user",
    render: (text) => (text ? <div title="User">{text}</div> : null),
  };

  if (props.documentParent === "Information Requirements Table") {
    columns.push(userColumn);
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
