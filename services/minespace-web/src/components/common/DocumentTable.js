import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import DocumentLink from "@/components/common/DocumentLink";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
  documentParent: PropTypes.string.isRequired,
  categoryDataIndex: PropTypes.string.isRequired,
  uploadDateIndex: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  handleDeleteDocument: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  deletePayload: PropTypes.objectOf(PropTypes.string),
  // eslint-disable-next-line react/no-unused-prop-types
  documentColumns: PropTypes.arrayOf(PropTypes.string),
  deletePermission: PropTypes.string,
};

const defaultProps = {
  documents: [],
  handleDeleteDocument: () => {},
  deletePayload: {},
  documentColumns: [],
  deletePermission: null,
};

const deleteEnabledDocumentParents = [
  "Major Mine Application",
  "Information Requirements Table",
  "Project Description",
  "Mine Incident",
];

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
  ];

  const categoryColumn = {
    title: "Category",
    dataIndex: props.categoryDataIndex,
    render: (text) => <div title="Category">{props.documentCategoryOptionsHash[text]}</div>,
  };

  const uploadDateColumn = {
    title: "Upload Date",
    dataIndex: props.uploadDateIndex,
    render: (text) => <div title="Upload Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
  };

  const canDeleteDocuments =
    props?.deletePayload &&
    props?.handleDeleteDocument &&
    props?.deletePermission &&
    deleteEnabledDocumentParents.includes(props.documentParent);
  if (canDeleteDocuments) {
    columns[0] = {
      title: "File Name",
      dataIndex: "document_name",
      render: (text, record) => {
        const { mine_document_guid } = record;
        const payload = { ...props.deletePayload, mineDocumentGuid: mine_document_guid };
        return (
          <div key={record?.mine_document_guid}>
            <DocumentLink
              documentManagerGuid={record.document_manager_guid}
              documentName={record.document_name}
              handleDelete={props.handleDeleteDocument}
              deletePayload={payload}
              deletePermission={props?.deletePermission}
            />
          </div>
        );
      },
      sorter: (a, b) => (a.document_name > b.document_name ? -1 : 1),
    };
  }

  if (props.documentColumns?.length > 0) {
    columns.push(...props.documentColumns);
  } else {
    columns.push(categoryColumn);
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
