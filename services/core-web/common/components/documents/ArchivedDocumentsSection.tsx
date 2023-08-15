import React from "react";
import DocumentTable from "@/components/common/DocumentTable";
import { Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Feature, isFeatureEnabled } from "@mds/common";
import { MineDocument } from "@common/models/documents/document";

interface ArchivedDocumentsSectionProps {
  documents: MineDocument[];
  documentColumns: any;
  titleLevel?: 1 | 2 | 3 | 4 | 5;
}

const ArchivedDocumentsSection = (props: ArchivedDocumentsSectionProps) => {
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
      />
    </div>
  );
};

export default ArchivedDocumentsSection;
