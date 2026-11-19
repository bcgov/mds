import React from "react";
import moment from "moment";
import { formatDateTime } from "@mds/common/redux/utils/helpers";
import ReferralConsultationPackage from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import { isVersionRow } from "@/components/noticeOfWork/applications/nowFileManagement";

// Columns shared by the Application, Government and Submission document tables

export const uploadDateColumn = {
  title: "Date/Time",
  dataIndex: "upload_date",
  key: "upload_date",
  sorter: (a, b) => (moment(a.upload_date) > moment(b.upload_date) ? -1 : 1),
  render: (text, record) => <div title="Due">{formatDateTime(record.upload_date)}</div>,
};

// Yes/No column for a package a document can belong to. The header only offers
// the package button while the application can still be changed.
export const packageFlagColumn = ({
  packageName,
  type,
  dataIndex,
  isInCompleteStatus,
}: {
  packageName: "Consultation" | "Referral";
  type: "CON" | "REF";
  dataIndex: "is_consultation_package" | "is_referral_package";
  isInCompleteStatus: boolean;
}) => ({
  width: 150,
  title: () => {
    const heading = (
      <div className="grid">
        <span>{packageName}</span>
        <span>Package</span>
      </div>
    );
    return isInCompleteStatus ? (
      heading
    ) : (
      <div className="inline-flex between">
        {heading}
        <ReferralConsultationPackage type={type} isTableHeaderView />
      </div>
    );
  },
  dataIndex,
  key: dataIndex,
  render: (text, record) =>
    isVersionRow(record) ? null : <div title={`${packageName} Package`}>{text ? "Yes" : "No"}</div>,
});
