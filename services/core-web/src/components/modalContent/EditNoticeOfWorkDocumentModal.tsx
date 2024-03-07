import React, { FC } from "react";
import EditNoticeOfWorkDocumentForm, {
  EditNoticeOfWorkDocumentFormProps,
} from "@/components/Forms/noticeOfWork/EditNoticeOfWorkDocumentForm";

export const EditNoticeOfWorkDocumentModal: FC<EditNoticeOfWorkDocumentFormProps> = (props) => {
  return (
    <div>
      <EditNoticeOfWorkDocumentForm {...props} />
    </div>
  );
};

export default EditNoticeOfWorkDocumentModal;
