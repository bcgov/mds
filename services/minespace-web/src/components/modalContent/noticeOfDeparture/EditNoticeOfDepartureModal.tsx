import React from "react";
import EditNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/EditNoticeOfDepartureForm";
import { INodDocumentPayload, INoticeOfDeparture } from "@mds/common/interfaces";

interface EditNoticeOfDepartureModalProps {
  onSubmit: (nod_guid: string, values: any, documentArray: INodDocumentPayload[]) => any;
  initialValues: INoticeOfDeparture;
  mineGuid: string;
  noticeOfDeparture: INoticeOfDeparture;
}

const EditNoticeofDepartureModal: React.FC<EditNoticeOfDepartureModalProps> = (props) => {
  const { onSubmit, initialValues, mineGuid, noticeOfDeparture } = props;

  return (
    <div>
      <EditNoticeOfDepartureForm
        initialValues={initialValues}
        mineGuid={mineGuid}
        onSubmit={onSubmit}
        noticeOfDeparture={noticeOfDeparture}
      />
    </div>
  );
};

export default EditNoticeofDepartureModal;
