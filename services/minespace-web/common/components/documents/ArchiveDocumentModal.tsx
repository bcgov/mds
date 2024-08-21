import React, { FC } from "react";

import DocumentTable from "@mds/common/components/documents/DocumentTable";
import { Alert, Button, Form, Typography } from "antd";
import { IMineDocument } from "@mds/common";
import { MineDocument } from "@mds/common/models/documents/document";

interface ArchiveDocumentModalProps {
  documents: IMineDocument[];
  handleSubmit(documents: IMineDocument[]): Promise<void>;
  closeModal(): void;
}

const transformDocs = (documents: IMineDocument[]): MineDocument[] =>
  documents.map((doc) => new MineDocument(doc));

const ArchiveDocumentModal: FC<ArchiveDocumentModalProps> = (props: ArchiveDocumentModalProps) => {
  return (
    <Form
      layout="vertical"
      onFinish={() => props.handleSubmit(props.documents).then(props.closeModal)}
    >
      <Typography.Paragraph>
        <Alert
          message="Archived files are not reviewed as part of the submission"
          showIcon
          type="warning"
          description="By archiving this file, you are archiving all of its previous versions. This action cannot be undone, you can find the file in Archived Documents."
        />
      </Typography.Paragraph>

      <Typography.Paragraph strong>
        You&apos;re about to archive the following file{props.documents?.length > 1 ? "s" : ""}:
      </Typography.Paragraph>

      <DocumentTable
        documents={transformDocs(props.documents)}
        view="minimal"
        excludedColumnKeys={["actions", "category"]}
      />

      <div className="ant-modal-footer">
        <Button className="full-mobile" onClick={props.closeModal}>
          Cancel
        </Button>
        <Button className="full-mobile" type="primary" htmlType="submit">
          Archive
        </Button>
      </div>
    </Form>
  );
};

export default ArchiveDocumentModal;
