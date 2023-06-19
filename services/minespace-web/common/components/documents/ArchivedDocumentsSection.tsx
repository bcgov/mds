import React from "react";
import DocumentTable from "@/components/common/DocumentTable";
import { Typography } from "antd";
import { IMineDocument } from "@mds/common";
import { DeleteOutlined } from "@ant-design/icons";
import { detectProdEnvironment as IN_PROD } from "@common/utils/environmentUtils";

interface ArchivedDocumentsSectionProps {
  documents: IMineDocument;
  documentColumns: any;
  titleLevel?: 1 | 2 | 3 | 4 | 5;
}

const ArchivedDocumentsSection = (props: ArchivedDocumentsSectionProps) => {
  if (IN_PROD()) {
    return <></>;
  }

  const docs = props.documents.map((d) => {
    d.name = d.document_name;

    return d;
  });

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
        documents={docs}
        excludedColumnKeys={["archive", "remove"]}
      />
    </div>
  );
};

export default ArchivedDocumentsSection;
