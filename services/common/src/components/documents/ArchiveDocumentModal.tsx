import React, { FC } from "react";
import { Alert, Typography } from "antd";
import { IMineDocument } from "@mds/common/interfaces/mineDocument.interface";
import { MineDocument } from "@mds/common/models/documents/document";
import DocumentTable from "./DocumentTable";
import FormWrapper from "../forms/FormWrapper";
import RenderCancelButton from "../forms/RenderCancelButton";
import RenderSubmitButton from "../forms/RenderSubmitButton";
import { FORM } from "@mds/common/constants";

interface ArchiveDocumentModalProps {
  documents: IMineDocument[];
  handleSubmit(documents: IMineDocument[]): Promise<void>;
}

const transformDocs = (documents: IMineDocument[]): MineDocument[] =>
  documents.map((doc) => new MineDocument(doc));

const ArchiveDocumentModal: FC<ArchiveDocumentModalProps> = ({ documents, handleSubmit }) => {
  return (
    <FormWrapper name={FORM.ARCHIVE_DOCUMENT} isModal onSubmit={() => handleSubmit(documents)}>
      <Typography.Paragraph>
        <Alert
          message="Archived files are not reviewed as part of the submission"
          showIcon
          type="warning"
          description="By archiving this file, you are archiving all of its previous versions. This action cannot be undone, you can find the file in Archived Documents."
        />
      </Typography.Paragraph>

      <Typography.Paragraph strong>
        You&apos;re about to archive the following file{documents?.length > 1 ? "s" : ""}:
      </Typography.Paragraph>

      <DocumentTable
        documents={transformDocs(documents)}
        view="minimal"
        excludedColumnKeys={["actions", "category"]}
      />

      <div className="ant-modal-footer">
        <RenderCancelButton />
        <RenderSubmitButton buttonText="Archive" disableOnClean={false} />
      </div>
    </FormWrapper>
  );
};

export default ArchiveDocumentModal;
