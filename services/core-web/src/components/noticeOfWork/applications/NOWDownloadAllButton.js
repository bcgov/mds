import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import DocumentCompression from "@mds/common/components/documents/DocumentCompression";
import { MineDocument } from "@mds/common/models/documents/document";

/*
Zips and downloads every file in a Manage Documents table, the same way as Major Projects' download. Only each file's
latest version is included, and Document Manager names each file in the zip, so replaced files download under their
current name.
*/

const propTypes = {
  // Table rows, previous versions and files that aren't in Document Manager yet (e.g. vFCBC files not imported) are skipped
  rows: PropTypes.arrayOf(PropTypes.any).isRequired,
  mineGuid: PropTypes.string.isRequired,
  // Keeps each table's progress notification separate
  documentType: PropTypes.string.isRequired,
};

export const toDownloadAllDocuments = (rows, mineGuid) =>
  rows
    .filter((row) => row.document_manager_guid && !row.mine_document_version_guid)
    .map(
      (row) =>
        new MineDocument({
          mine_document_guid: row.mine_document_guid,
          document_manager_guid: row.document_manager_guid,
          document_name: row.filename,
          mine_guid: mineGuid,
        })
    );

export const NOWDownloadAllButton = (props) => {
  const [isCompressionModal, setIsCompressionModal] = useState(false);
  const [isCompressionInProgress, setIsCompressionInProgress] = useState(false);
  const documents = toDownloadAllDocuments(props.rows, props.mineGuid);

  return (
    <>
      <DocumentCompression
        documentType={props.documentType}
        mineDocuments={documents}
        setCompressionModalVisible={setIsCompressionModal}
        isCompressionModalVisible={isCompressionModal}
        setCompressionInProgress={setIsCompressionInProgress}
        // Like Major Projects, warns that previous versions and archived files aren't included
        showDownloadWarning
      />
      <Button
        type="secondary"
        className="full-mobile"
        onClick={() => setIsCompressionModal(true)}
        disabled={isCompressionInProgress || documents.length === 0}
      >
        <DownloadOutlined className="padding-sm--right icon-sm" />
        Download All
      </Button>
    </>
  );
};

NOWDownloadAllButton.propTypes = propTypes;

export default NOWDownloadAllButton;
