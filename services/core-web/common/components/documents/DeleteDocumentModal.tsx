import React, { FC } from "react";

import DocumentTable from "@/components/common/DocumentTable";
import { Alert, Button, Form, Typography } from "antd";
import { MineDocument } from "@common/models/documents/document";

interface DeleteDocumentModalProps {
  documents: MineDocument[];
  handleSubmit(documents: MineDocument[]): Promise<void>;
  closeModal(): void;
}

const DeleteDocumentModal: FC<DeleteDocumentModalProps> = (props: DeleteDocumentModalProps) => {
  return (
    <Form
      layout="vertical"
      onFinish={() => props.handleSubmit(props.documents).then(props.closeModal)}
    >
      <Typography.Paragraph>
        <Alert
          message="Deleted files are not reviewed as part of the submission"
          showIcon
          type="warning"
          description="By deleting this file, you are deleting all of its previous versions. This action cannot be undone."
        />
      </Typography.Paragraph>

      <Typography.Paragraph strong>
        You&apos;re about to delete the following file{props.documents?.length > 1 ? "s" : ""}:
      </Typography.Paragraph>

      <DocumentTable
        documents={props.documents}
        view="minimal"
        uploadDateIndex="upload_date"
        excludedColumnKeys={["archive", "remove", "category"]}
      />

      <div className="ant-modal-footer">
        <Button className="full-mobile" onClick={props.closeModal}>
          Cancel
        </Button>
        <Button className="full-mobile" type="primary" htmlType="submit">
          Delete
        </Button>
      </div>
    </Form>
  );
};

export default DeleteDocumentModal;
