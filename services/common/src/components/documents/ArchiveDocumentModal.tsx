import React, { FC } from "react";
import { Alert, Typography } from "antd";
import { IMineDocument } from "@mds/common/interfaces/mineDocument.interface";
import { MineDocument } from "@mds/common/models/documents/document";
import DocumentTable from "./DocumentTable";
import FormWrapper from "../forms/FormWrapper";
import RenderCancelButton from "../forms/RenderCancelButton";
import RenderSubmitButton from "../forms/RenderSubmitButton";
import { FORM } from "@mds/common/constants/forms";

interface ArchiveDocumentModalProps {
  documents: IMineDocument[];
  handleSubmit(documents: IMineDocument[]): Promise<void>;
  alertMessage?: string;
  alertDescription?: string;
  // Shown as a second warning, e.g. when an archived file is referenced in permit conditions
  extraWarning?: string;
}

const DEFAULT_ALERT_MESSAGE = "Archived files are not reviewed as part of the submission";
const DEFAULT_ALERT_DESCRIPTION =
  "By archiving this file, you are archiving all of its previous versions. This action cannot be undone, you can find the file in Archived Documents.";

const transformDocs = (documents: IMineDocument[]): MineDocument[] =>
  documents.map((doc) => new MineDocument(doc));

const ArchiveDocumentModal: FC<ArchiveDocumentModalProps> = ({
  documents,
  handleSubmit,
  alertMessage = DEFAULT_ALERT_MESSAGE,
  alertDescription = DEFAULT_ALERT_DESCRIPTION,
  extraWarning,
}) => {
  return (
    <FormWrapper name={FORM.ARCHIVE_DOCUMENT} isModal onSubmit={() => handleSubmit(documents)}>
      <Typography.Paragraph>
        <Alert message={alertMessage} showIcon type="warning" description={alertDescription} />
      </Typography.Paragraph>
      {extraWarning && (
        <Typography.Paragraph>
          <Alert message={extraWarning} showIcon type="warning" />
        </Typography.Paragraph>
      )}

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
