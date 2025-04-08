import React from "react";
import AddNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/AddNoticeOfDepartureForm";
import {
  ICreateNoD,
  INodDocumentPayload,
  INoticeOfDeparture,
  IPermit,
} from "@mds/common/interfaces";
import { AxiosResponse } from "axios";
interface AddNoticeOfDepartureModalProps {
  onSubmit: (
    permitNumber: string,
    values: ICreateNoD,
    documentArray: INodDocumentPayload[]
  ) => Promise<AxiosResponse<INoticeOfDeparture>>;
  mineGuid: string;
  permits: IPermit[];
}

const AddNoticeOfDepartureModal: React.FC<AddNoticeOfDepartureModalProps> = (props) => {
  const { onSubmit, mineGuid, permits } = props;

  return (
    <div>
      <AddNoticeOfDepartureForm permits={permits} onSubmit={onSubmit} mineGuid={mineGuid} />
    </div>
  );
};

export default AddNoticeOfDepartureModal;
