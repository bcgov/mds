import React, { FC, useState, useEffect } from "react";
import { Button, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import CoreTable from "@mds/common/components/common/CoreTable";
import { formatDate, formatDateTime } from "@mds/common/redux/utils/helpers";
import { openDocument } from "@mds/common/components/syncfusion/DocumentViewer";
import { useAppDispatch } from "@mds/common/redux/rootState";

export interface PackageDocument {
  mine_document_guid: string;
  document_manager_guid: string;
  document_manager_version_guid?: string | null;
  document_name: string;
  version_number: number;
  version_label: string;
  category?: string;
}

export interface Package {
  package_order: number;
  package_name: string;
  create_user: string;
  create_timestamp: string;
  documents: PackageDocument[];
}

interface NOWPackagesTableProps {
  isLoaded: boolean;
  packageType: string; // used for labels and class names only
  packageKey: string;
  documentKey: string;
  packages: Package[];
}

// Package and document records are keyed by type-specific fields, e.g. now_application_referral_package_guid
export const NOWPackagesTable: FC<NOWPackagesTableProps> = ({
  isLoaded,
  packageType,
  packageKey,
  documentKey,
  packages = [],
}) => {
  const getPackageGuid = (pkg: Package) => pkg[packageKey as keyof Package] as string;
  const dispatch = useAppDispatch();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (packages?.length > 0 && expandedRowKeys.length === 0) {
      setExpandedRowKeys([getPackageGuid(packages[0])]);
    }
  }, [packages]);

  const onExpand = (expanded: boolean, record: Package) => {
    if (expanded) {
      setExpandedRowKeys((prev) => [...prev, getPackageGuid(record)]);
    } else {
      setExpandedRowKeys((prev) => prev.filter((k) => k !== getPackageGuid(record)));
    }
  };

  const packageColumns: ColumnsType<Package> = [
    {
      title: "Package",
      dataIndex: "package_name",
      key: "package_name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Date",
      dataIndex: "create_timestamp",
      key: "create_timestamp",
      render: (text) => <div title={formatDateTime(text)}>{formatDate(text)}</div>,
    },
    {
      title: "Created By",
      dataIndex: "create_user",
      key: "create_user",
      render: (text) => text || "N/A",
    },
    {
      title: "Files",
      key: "files",
      render: (_text, record) => record.documents?.length || 0,
    },
  ];

  const documentColumns: ColumnsType<PackageDocument> = [
    {
      title: "File Name",
      dataIndex: "document_name",
      key: "document_name",
      render: (text) => text || "N/A",
    },
    {
      title: "Version",
      dataIndex: "version_label",
      key: "version_label",
      render: (text, record) =>
        text || (record.version_number ? `v${record.version_number}` : "v1"),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text) => text || "N/A",
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_text, record) => (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <Button
            type="link"
            onClick={() =>
              dispatch(
                openDocument(
                  record.document_manager_guid,
                  record.document_name,
                  null,
                  record.document_manager_version_guid
                )
              )
            }
            aria-label={`View ${record.document_name}`}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const renderExpandedRow = (record: Package) => {
    return (
      <Table
        rowKey={documentKey}
        columns={documentColumns}
        dataSource={record.documents || []}
        pagination={false}
      />
    );
  };

  const rowData = (packages || []).map((pkg) => ({
    ...pkg,
    key: getPackageGuid(pkg),
  }));

  return (
    <CoreTable
      condition={isLoaded}
      dataSource={rowData}
      columns={packageColumns}
      classPrefix={`${packageType}-packages`}
      rowKey={packageKey}
      expandProps={{
        rowKey: packageKey,
        recordDescription: `${packageType} package documents`,
        rowExpandable: (record: Package) => (record.documents?.length ?? 0) > 0,
        getDataSource: (record: Package) => record.documents || [],
        expandedRowKeys,
        onExpand,
        expandedRowRender: renderExpandedRow,
      }}
    />
  );
};

export default NOWPackagesTable;
