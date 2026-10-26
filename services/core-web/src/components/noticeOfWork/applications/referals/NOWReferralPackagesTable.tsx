import React, { FC, useState, useEffect } from "react";
import { Button, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import CoreTable from "@mds/common/components/common/CoreTable";
import { formatDate, formatDateTime } from "@mds/common/redux/utils/helpers";
import { openDocument } from "@mds/common/components/syncfusion/DocumentViewer";
import { useAppDispatch } from "@mds/common/redux/rootState";

export interface ReferralPackageDocument {
  now_application_referral_package_document_xref_guid: string;
  mine_document_guid: string;
  document_manager_guid: string;
  document_manager_version_guid?: string | null;
  document_name: string;
  version_number: number;
  version_label: string;
  category?: string;
}

export interface ReferralPackage {
  now_application_referral_package_id: number;
  now_application_referral_package_guid: string;
  package_order: number;
  package_name: string;
  create_user: string;
  create_timestamp: string;
  documents: ReferralPackageDocument[];
}

interface NOWReferralPackagesTableProps {
  isLoaded: boolean;
  referralPackages: ReferralPackage[];
}

export const NOWReferralPackagesTable: FC<NOWReferralPackagesTableProps> = ({
  isLoaded,
  referralPackages = [],
}) => {
  const dispatch = useAppDispatch();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (referralPackages?.length > 0 && expandedRowKeys.length === 0) {
      setExpandedRowKeys([referralPackages[0].now_application_referral_package_guid]);
    }
  }, [referralPackages]);

  const onExpand = (expanded: boolean, record: ReferralPackage) => {
    if (expanded) {
      setExpandedRowKeys((prev) => [...prev, record.now_application_referral_package_guid]);
    } else {
      setExpandedRowKeys((prev) =>
        prev.filter((k) => k !== record.now_application_referral_package_guid)
      );
    }
  };

  const packageColumns: ColumnsType<ReferralPackage> = [
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
      render: (text) => (
        <div title={formatDateTime(text)}>{formatDate(text)}</div>
      ),
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

  const documentColumns: ColumnsType<ReferralPackageDocument> = [
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

  const renderExpandedRow = (record: ReferralPackage) => {
    return (
      <Table
        rowKey="now_application_referral_package_document_xref_guid"
        columns={documentColumns}
        dataSource={record.documents || []}
        pagination={false}
      />
    );
  };

  const rowData = (referralPackages || []).map((pkg) => ({
    ...pkg,
    key: pkg.now_application_referral_package_guid,
  }));

  return (
    <CoreTable
      condition={isLoaded}
      dataSource={rowData}
      columns={packageColumns}
      classPrefix="referral-packages"
      rowKey="now_application_referral_package_guid"
      expandProps={{
        rowKey: "now_application_referral_package_guid",
        recordDescription: "referral package documents",
        rowExpandable: (record: ReferralPackage) => (record.documents?.length ?? 0) > 0,
        getDataSource: (record: ReferralPackage) => record.documents || [],
        expandedRowKeys,
        onExpand,
        expandedRowRender: renderExpandedRow,
      }}
    />
  );
};

export default NOWReferralPackagesTable;
