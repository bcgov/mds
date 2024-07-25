import React, { FC } from "react";
import { Row, Col, Typography } from "antd";
import DocumentTable from "../documents/DocumentTable";
import { IMineDocument } from "../..";
import { MineDocument } from "@mds/common/models/documents/document";
import { formatUrlToUpperCaseString } from "@mds/common/redux/utils/helpers";

interface ProjectDocumentsTabSectionProps {
  id: string;
  title?: string;
  documents: IMineDocument[];
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
        <Typography.Title level={3}>{sectionTitle}</Typography.Title>
      </Col>
      <Col span={24}>
        <DocumentTable
          documents={documents?.map((d) => new MineDocument(d)) ?? []}
          documentParent={title}
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
