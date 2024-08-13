import React, { FC } from "react";
import { Row, Col, Typography } from "antd";
import DocumentTable from "../documents/DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";
import { formatUrlToUpperCaseString } from "@mds/common/redux/utils/helpers";
import { renderTextColumn } from "../common/CoreTableCommonColumns";

interface ProjectDocumentsTabSectionProps {
  id: string;
  title?: string;
  documents: MineDocument[];
  onArchivedDocuments: () => Promise<void>;
  canArchive?: boolean;
}
const ProjectDocumentsTabSection: FC<ProjectDocumentsTabSectionProps> = ({
  documents,
  onArchivedDocuments,
  id,
  title,
  canArchive = true,
}) => {
  const sectionTitle = title ?? formatUrlToUpperCaseString(id);

  return (
    <Row id={id}>
      <Col span={24}>
        <Typography.Title level={4}>{sectionTitle}</Typography.Title>
      </Col>
      <Col span={24}>
        <DocumentTable
          documents={documents ?? []}
          documentParent={title}
          additionalColumns={[renderTextColumn("category", "Category")]}
          canArchiveDocuments={canArchive}
          onArchivedDocuments={onArchivedDocuments}
          showVersionHistory={true}
          enableBulkActions={true}
        />
      </Col>
    </Row>
  );
};

export default ProjectDocumentsTabSection;
