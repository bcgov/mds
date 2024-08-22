import React, { FC } from "react";
import { Alert, Typography } from "antd";
import { MineDocument } from "@mds/common/models/documents/document";
import DocumentTable from "./DocumentTable";
import FormWrapper from "../forms/FormWrapper";
import RenderCancelButton from "../forms/RenderCancelButton";
import RenderSubmitButton from "../forms/RenderSubmitButton";
import { FORM } from "@mds/common/constants";

interface DeleteDocumentModalProps {
  documents: MineDocument[];
  handleSubmit(documents: MineDocument[]): Promise<void>;
}

const DeleteDocumentModal: FC<DeleteDocumentModalProps> = ({ documents, handleSubmit }) => {
  return (
    <FormWrapper name={FORM.DELETE_DOCUMENT} onSubmit={() => handleSubmit(documents)} isModal>
      <Typography.Paragraph>
        <Alert
          message="Deleted files are not reviewed as part of the submission"
          showIcon
          type="warning"
          description="By deleting this file, you are deleting all of its previous versions. This action cannot be undone."
        />
      </Typography.Paragraph>

      <Typography.Paragraph strong>
        You&apos;re about to delete the following file{documents?.length > 1 ? "s" : ""}:
      </Typography.Paragraph>

      <DocumentTable
        documents={documents}
        view="minimal"
        excludedColumnKeys={["actions", "category"]}
      />

      <div className="ant-modal-footer">
        <RenderCancelButton />
        <RenderSubmitButton buttonText="Delete" disableOnClean={false} />
      </div>
    </FormWrapper>
  );
};

export default DeleteDocumentModal;
