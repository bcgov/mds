import React, { FC, useState } from "react";
import { useDispatch } from "react-redux";
import DocumentTableProps from "@mds/common/interfaces/document/documentTableProps.interface";
import { IMineDocument } from "../../..";
import CoreTable from "../../common/CoreTable";
import { uploadDateColumn, uploadedByColumn } from "../DocumentColumns";
import {
  ITableAction,
  renderActionsColumn,
  renderTaggedColumn,
} from "../../common/CoreTableCommonColumns";
import { openModal } from "@mds/common/redux/actions/modalActions";
import ViewSpatialDetailModal from "./ViewSpatialDetailModal";
import DocumentCompression from "../DocumentCompression";
import { MineDocument } from "@mds/common/models/documents/document";

interface ISpatialBundle {
  bundle_id: number | string;
  document_name: string;
  upload_date: string;
  bundleFiles: IMineDocument[];
}

const SpatialDocumentTable: FC<DocumentTableProps> = ({ documents }) => {
  const dispatch = useDispatch();
  const [isCompressionModalVisible, setIsCompressionModalVisible] = useState(false);
  const [isCompressionInProgress, setIsCompressionInProgress] = useState(false);

  const temp_spatial_documents = documents.map((doc) => ({ ...doc, bundle_id: 1 }));
  const mineDocuments = documents.map((doc) => new MineDocument(doc));

  const spatial_bundle_ids = Array.from(
    new Set(temp_spatial_documents.map((doc) => doc.bundle_id))
  );
  const spatial_bundles = spatial_bundle_ids.map((id) => {
    const bundleFiles = temp_spatial_documents.filter((doc) => doc.bundle_id === id);
    const document_name = bundleFiles[0].document_name.split(".")[0];
    const create_user = bundleFiles[0].create_user;
    const upload_date = bundleFiles.sort((a, b) => a.upload_date.localeCompare(b.upload_date))[0]
      .upload_date;
    const bundleSize = bundleFiles.length;

    return {
      document_name,
      bundleFiles,
      upload_date,
      create_user,
      bundleSize,
      bundle_id: id,
      isParent: true,
    };
  });

  const downloadSpatialBundle = (event, record) => {
    setIsCompressionModalVisible(true);
    console.log("initiate download all", event, record);
  };
  const viewSpatialBundle = (event, record) => {
    console.log("initiate view", event, record);
    dispatch(
      openModal({
        props: {
          title: "View Spatial Data",
          spatialBundle: record.bundleFiles,
        },
        content: ViewSpatialDetailModal,
      })
    );
  };
  const recordActionsFilter = (record, allActions) => {
    if (record.isParent) return allActions;
    return [];
  };

  const actions: ITableAction[] = [
    { key: "download-all", label: "Download All", clickFunction: downloadSpatialBundle },
    { key: "view-detail", label: "View Details", clickFunction: viewSpatialBundle },
  ];

  const columns = [
    renderTaggedColumn("document_name", "bundleSize", "File Name"),
    uploadDateColumn("upload_date", "Last Modified"),
    uploadedByColumn("create_user", "Created By"),
    renderActionsColumn({ actions, recordActionsFilter }),
  ];

  return (
    <>
      <DocumentCompression
        mineDocuments={mineDocuments}
        setCompressionModalVisible={setIsCompressionModalVisible}
        isCompressionModalVisible={isCompressionModalVisible}
        setCompressionInProgress={setIsCompressionInProgress}
        showDownloadWarning={false}
      />
      <CoreTable
        dataSource={spatial_bundles}
        rowKey="bundle_id"
        columns={columns}
        expandProps={{
          getDataSource: (record) => record.bundleFiles,
          recordDescription: "spatial file bundle",
          childrenColumnName: "bundleFiles",
          matchChildColumnsToParent: true,
          rowKey: "document_manager_guid",
          rowExpandable: (record) => record.bundleSize > 0,
        }}
      />
    </>
  );
};

export default SpatialDocumentTable;
