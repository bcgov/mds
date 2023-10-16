import React from "react";
import EditNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/EditNoticeOfDepartureForm";
import { INodDocumentPayload, INoticeOfDeparture } from "@mds/common";

interface EditNoticeOfDepartureModalProps {
  onSubmit: (nod_guid: string, values: any, documentArray: INodDocumentPayload[]) => any;
  initialValues: INoticeOfDeparture;
  afterClose: () => void;
  closeModal: () => void;
  mineGuid: string;
  noticeOfDeparture: INoticeOfDeparture;
}

const AddNoticeOfDepartureModal: React.FC<EditNoticeOfDepartureModalProps> = (props) => {
  const { onSubmit, initialValues, afterClose, closeModal, mineGuid, noticeOfDeparture } = props;

  const close = () => {
    closeModal();
    afterClose();
  };

  return (
    <div>
      <EditNoticeOfDepartureForm
        initialValues={initialValues}
        mineGuid={mineGuid}
        onSubmit={onSubmit}
        closeModal={close}
        noticeOfDeparture={noticeOfDeparture}
      />
    </div>
  );
};

export default AddNoticeOfDepartureModal;
