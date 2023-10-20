import React, { FC, FunctionComponent, ReactElement } from "react";

import { Alert, Button, Form, Typography } from "antd";
import { MineDocument } from "@mds/common/models/documents/document";
import DocumentTableProps from "@mds/common/interfaces/document/documentTableProps.interface";

interface DeleteDocumentModalProps {
  DocumentTable: FunctionComponent<DocumentTableProps>;
  documents: MineDocument[];
  handleSubmit(documents: MineDocument[]): Promise<void>;
  closeModal(): void;
}

const DeleteDocumentModal: FC<DeleteDocumentModalProps> = (props: DeleteDocumentModalProps) => {
  const DocumentTable = props.DocumentTable;

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
        excludedColumnKeys={["actions", "category"]}
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
