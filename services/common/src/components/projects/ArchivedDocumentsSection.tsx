import React, { FC } from "react";
import { Typography } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { Feature } from "@mds/common/utils/featureFlag";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import DocumentTable from "../documents/DocumentTable";
import { renderCategoryColumn, renderTextColumn } from "../common/CoreTableCommonColumns";
import { CATEGORY_CODE } from "@mds/common/constants/strings";
import { IMineDocument } from "@mds/common/interfaces/mineDocument.interface";

interface ArchivedDocumentsSectionProps {
  documents: IMineDocument[];
  titleLevel?: 1 | 2 | 3 | 4 | 5;
  href?: string;
  showCategory?: boolean;
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

  const hasDocumentsWithLabels = documents?.some(doc => doc?.label) || false;
  const categoryColumn = renderCategoryColumn("category_code", "Category", CATEGORY_CODE);
  const labelColumn = renderTextColumn("label", "Document Label");

  const additionalColumns = hasDocumentsWithLabels
    ? [categoryColumn, labelColumn]
    : [categoryColumn];

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
        canReplaceDocuments={false}
        additionalColumns={showCategory ? additionalColumns : []}
      />
    </div>
  );
};

export default ArchivedDocumentsSection;
