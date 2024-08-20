import React, { FC } from "react";
import { Typography } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { Feature } from "@mds/common/utils/featureFlag";
import { MineDocument } from "@mds/common/models/documents/document";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import DocumentTable from "../documents/DocumentTable";
import { renderCategoryColumn } from "../common/CoreTableCommonColumns";
import { CATEGORY_CODE } from "../..";
import { ColumnType } from "antd/es/table";

interface ArchivedDocumentsSectionProps {
  documents: MineDocument[];
  titleLevel?: 1 | 2 | 3 | 4 | 5;
  href?: string;
  showCategory?: boolean;
  documentColumns?: ColumnType<MineDocument>[];
}

const ArchivedDocumentsSection: FC<ArchivedDocumentsSectionProps> = ({
  titleLevel = 4,
  href = "archived-documents",
  documents,
  showCategory = true,
}) => {
  const { isFeatureEnabled } = useFeatureFlag();

  if (!isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE)) {
    return <></>;
  }

  const additionalColumns = showCategory
    ? [renderCategoryColumn("category_code", "Category", CATEGORY_CODE)]
    : [];

  return (
    <div id={href}>
      <Typography.Title level={titleLevel}>
        <DeleteOutlined />
        &nbsp;Archived Documents
      </Typography.Title>
      <Typography.Paragraph>
        These files are not reviewed as part of the submission.
      </Typography.Paragraph>
      <DocumentTable
        documents={documents}
        showVersionHistory={true}
        additionalColumns={additionalColumns}
      />
    </div>
  );
};

export default ArchivedDocumentsSection;
