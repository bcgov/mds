import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
  // eslint-disable-next-line react/no-unused-prop-types
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  documents: [],
};

export const DocumentTable = (props) => {
  const columns = [
    {
      title: "File name",
      dataIndex: "document_name",
      render: (text, record) => {
        return (
          <div title="File name">
            <LinkButton title={text} onClick={() => downloadFileFromDocumentManager(record)}>
              {truncateFilename(text)}
            </LinkButton>
          </div>
        );
      },
    },
    {
      title: "Category",
      dataIndex: "variance_document_category_code",
      render: (text) => <div title="Upload date">{props.documentCategoryOptionsHash[text]}</div>,
    },
    {
      title: "Upload date",
      dataIndex: "created_at",
      render: (text) => <div title="Upload date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
    },
  ];

  return (
    <div>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        rowKey={(record) => record.mine_document_guid}
        locale={{ emptyText: "This variance does not contain any documents." }}
        dataSource={props.documents}
      />
    </div>
  );
};

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
