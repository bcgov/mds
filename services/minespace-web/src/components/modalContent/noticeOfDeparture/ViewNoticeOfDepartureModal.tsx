import React from "react";
import { Button } from "antd";
import NoticeOfDepartureDetails from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDepartureDetails";
import { INoticeOfDeparture } from "@mds/common";

interface ViewNoticeOfDepartureModalProps {
  closeModal: () => void;
  noticeOfDeparture: INoticeOfDeparture;
}

export const ViewNoticeOfDepartureModal: React.FC<ViewNoticeOfDepartureModalProps> = ({
  noticeOfDeparture,
  closeModal,
}) => (
  <div>
    <NoticeOfDepartureDetails noticeOfDeparture={noticeOfDeparture} />
    <div className="ant-modal-footer">
      <Button onClick={closeModal}>Close</Button>
    </div>
  </div>
);

export default ViewNoticeOfDepartureModal;
