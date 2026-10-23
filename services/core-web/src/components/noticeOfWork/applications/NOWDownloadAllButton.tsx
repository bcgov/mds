import React, { FC, useState } from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import DocumentCompression from "@mds/common/components/documents/DocumentCompression";
import { MineDocument } from "@mds/common/models/documents/document";

/*
Zips and downloads every file in a Manage Documents table, the same way as Major Projects' download. Only each file's
latest version is included, and Document Manager names each file in the zip, so replaced files download under their
current name.
*/

// A Manage Documents table row, only the fields used to build the download are typed
interface IDownloadAllRow {
  mine_document_guid?: string;
  document_manager_guid?: string;
  mine_document_version_guid?: string;
  filename?: string;
  [key: string]: any;
}

interface NOWDownloadAllButtonProps {
  // Table rows, previous versions and files that aren't in Document Manager yet (e.g. vFCBC files not imported) are skipped
  rows: IDownloadAllRow[];
  mineGuid: string;
  // Keeps each table's progress notification separate
  documentType: string;
}

export const toDownloadAllDocuments = (rows: IDownloadAllRow[], mineGuid: string): MineDocument[] =>
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

export const NOWDownloadAllButton: FC<NOWDownloadAllButtonProps> = (props) => {
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
        type="default"
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

export default NOWDownloadAllButton;
