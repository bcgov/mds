import React, { FC } from "react";
import { Row, Col, Typography } from "antd";
import DocumentTable from "../documents/DocumentTable";
import { IMineDocument } from "../..";
import { MineDocument } from "@mds/common/models/documents/document";
import { formatUrlToUpperCaseString } from "@mds/common/redux/utils/helpers";

interface ProjectDocumentsTabSectionProps {
  id: string;
  documents: IMineDocument[];
  onArchivedDocuments: () => Promise<void>;
}
const ProjectDocumentsTabSection: FC<ProjectDocumentsTabSectionProps> = ({
  documents,
  onArchivedDocuments,
  id,
}) => {
  const title = formatUrlToUpperCaseString(id);

  return (
    <Row id={id}>
      <Col span={24}>
        <Typography.Title level={3}>{title}</Typography.Title>
      </Col>
      <Col span={24}>
        <DocumentTable
          documents={documents?.map((d) => new MineDocument(d)) ?? []}
          documentParent={title}
          canArchiveDocuments={true}
          onArchivedDocuments={onArchivedDocuments}
          showVersionHistory={true}
          enableBulkActions={true}
        />
      </Col>
    </Row>
  );
};

export default ProjectDocumentsTabSection;
