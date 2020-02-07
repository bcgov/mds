import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "antd";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  amendmentFiles: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const columns = [
  {
    title: "File Name",
    dataIndex: "document_name",
    key: "document_name",
    sorter: (a, b) => a.document_name.localeCompare(b.document_name),
    defaultSortOrder: "descend",
    render: (text, record) => (
      <LinkButton
        key={record.permit_amendment_document_guid}
        onClick={() => downloadFileFromDocumentManager(record)}
      >
        {text}
      </LinkButton>
    ),
  },
];

export const ViewPermitAmendmentFiles = (props) => (
  <div>
    <Table
      size="small"
      pagination={false}
      columns={columns}
      dataSource={
        props.amendmentFiles && props.amendmentFiles.length > 0 ? props.amendmentFiles : []
      }
      locale={{ emptyText: "This amendment has no files." }}
    />
    <div className="ant-modal-footer" style={{ paddingTop: "16px" }}>
      <Button onClick={props.closeModal}>Close</Button>
    </div>
  </div>
);

ViewPermitAmendmentFiles.propTypes = propTypes;

export default ViewPermitAmendmentFiles;
