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
}

const ArchivedDocumentsSection = (props: ArchivedDocumentsSectionProps) => {
  if (!isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE)) {
    return <></>;
  }

  const parseArchivedDocuments = () => {
    return props.documents.map((obj) => ({
      ...obj,
      key: obj.mine_document_guid,
      file_location_type_code: obj.major_mine_application_document_xref.major_mine_application_document_type_code
        || obj.project_summary_document_xref.project_summary_document_type_code
        || obj.project_decision_package_document_xref.project_decision_package_document_type_code
        || obj.information_requirements_table_document_xref.information_requirements_table_document_type_code,
      versions: obj.versions.map((version) => ({
        ...version,
        key: obj.mine_document_guid,
        file_location_type_code: obj.file_location_type_code,
      })),
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
        documents={
          props.documents && props.documents.length > 0
            ? parseArchivedDocuments().map((doc) => new MajorMineApplicationDocument(doc))
            : []
        }
        excludedColumnKeys={["archive", "remove"]}
        showVersionHistory={true}
        additionalColumns={[
          renderCategoryColumn(
            "file_location_type_code",
            "File Location",
            Strings.FILE_LOCATION_TYPE_CODE_LOCATION,
            true
          ),
        ]}
      />
    </div>
  );
};

export default ArchivedDocumentsSection;
