import React from "react";
import DocumentTable from "@/components/common/DocumentTable";
import { Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Feature } from "@mds/common";
import { MineDocument } from "@common/models/documents/document";
import { ColumnType } from "antd/es/table";
import { useFeatureFlag } from "@common/providers/featureFlags/useFeatureFlag";

interface ArchivedDocumentsSectionProps {
  documents: MineDocument[];
  documentColumns: any;
  titleLevel?: 1 | 2 | 3 | 4 | 5;
  additionalColumns?: ColumnType<MineDocument>[];
}

const ArchivedDocumentsSection = (props: ArchivedDocumentsSectionProps) => {
  const { isFeatureEnabled } = useFeatureFlag();

  if (!isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE)) {
    return <></>;
  }

  return (
    <div id="archived-documents">
      <Typography.Title level={props.titleLevel || 4}>
        <DeleteOutlined className="violet" />
        &nbsp;Archived Documents
      </Typography.Title>
      <Typography.Paragraph>
        These files are not reviewed as part of the submission.
      </Typography.Paragraph>
      <DocumentTable
        documentColumns={props.documentColumns}
        documents={props.documents}
        excludedColumnKeys={["archive", "remove"]}
        showVersionHistory={true}
        additionalColumns={props.additionalColumns}
      />
    </div>
  );
};

export default ArchivedDocumentsSection;
