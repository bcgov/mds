import React from "react";
import DocumentTable from "@/components/common/DocumentTable";
import { Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Feature, isFeatureEnabled } from "@mds/common";
import { MajorMineApplicationDocument } from "@common/models/documents/document";
import { renderCategoryColumn } from "@/components/common/CoreTableCommonColumns";
import * as Strings from "@common/constants/strings";
interface ArchivedDocumentsSectionProps {
  documents: MajorMineApplicationDocument[];
  documentColumns: any;
  titleLevel?: 1 | 2 | 3 | 4 | 5;
  archivedDocuments: MajorMineApplicationDocument[];
}

const ArchivedDocumentsSection = (props: ArchivedDocumentsSectionProps) => {
  if (!isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE)) {
    return <></>;
  }

  const parseArchivedDocuments = () => {
    return props.archivedDocuments.map(obj => ({
      ...obj,
      key: obj.mine_document_guid,
      major_mine_application_document_type_code: props.documents.filter((data) => data.document_name === obj.document_name)[0].major_mine_application_document_type_code,
      versions: obj.versions.map(version => ({
        ...version,
        major_mine_application_document_type_code: obj.major_mine_application_document_type_code
      }))
    }));
  };

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
        documents={props.documents ? parseArchivedDocuments().map((doc) => new MajorMineApplicationDocument(doc)) : []}
        excludedColumnKeys={["archive", "remove"]}
        showVersionHistory={true}
        additionalColumns={[
          renderCategoryColumn(
            "major_mine_application_document_type_code",
            "File Location",
            Strings.MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE_LOCATION,
            true
          ),
        ]}
      />
    </div>
  );
};

export default ArchivedDocumentsSection;
