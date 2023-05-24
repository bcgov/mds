import React from "react";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import * as FORM from "@/constants/forms";
import AddNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/AddNoticeOfDepartureForm";
import { INoDPermit, ICreateNoD, INodDocumentPayload, INoticeOfDeparture } from "@mds/common";
import { AxiosResponse } from "axios";
import { RootState } from "@/App";

interface AddNoticeOfDepartureModalProps {
  onSubmit: (
    permitNumber: string,
    values: ICreateNoD,
    documentArray: INodDocumentPayload
  ) => Promise<AxiosResponse<INoticeOfDeparture>>;
  initialValues: ICreateNoD;
  afterClose: () => void;
  closeModal: () => void;
  mineGuid: string;
  permits: INoDPermit[];
}

const AddNoticeOfDepartureModal: React.FC<AddNoticeOfDepartureModalProps> = (props) => {
  const { onSubmit, initialValues, afterClose, closeModal, mineGuid, permits } = props;

  const close = () => {
    closeModal();
    afterClose();
  };

  return (
    <div>
      <AddNoticeOfDepartureForm
        permits={permits}
        onSubmit={onSubmit}
        mineGuid={mineGuid}
        closeModal={close}
        initialValues={initialValues}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  addNoticeOfDepartureFormValues: getFormValues(FORM.ADD_NOTICE_OF_DEPARTURE)(state) || {},
});

export default connect(mapStateToProps)(AddNoticeOfDepartureModal);
