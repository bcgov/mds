import DocumentTable from "@/components/common/DocumentTable";
import { Alert, Button, Form, Typography } from "antd";
import React, { FC } from "react";

interface ArchiveDocumentModalProps {
  documents: any[];
  handleSubmit(documents: any[]): Promise<void>;
  closeModal(): void;
}

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
          description="By archiving this file, you are archiving all of its previous versions. You can find the file in Archived Documents if you wish to undo this action later"
        />
      </Typography.Paragraph>

      <Typography.Paragraph strong>
        You&apos;re about to archive the following file{props.documents?.length > 1 ? "s" : ""}:
      </Typography.Paragraph>

      <DocumentTable
        documents={props.documents}
        view="minimal"
        excludedColumnKeys={["archive", "remove"]}
      />

      <div className="right center-mobile">
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
