import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Table, Badge } from "antd";
import { ColumnsType } from "antd/es/table";
import { INoticeOfWorkApplicationStages } from "@mds/common/interfaces";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getApplicationStageStatusType } from "@mds/common/constants/badgeStatusTypes";

interface NoticeOfWorkStagesTableProps {
  nowApplicationStages: INoticeOfWorkApplicationStages[];
}

export const NoticeOfWorkStagesTable: FC<NoticeOfWorkStagesTableProps> = ({
  nowApplicationStages,
}) => {
  const noticeOfWork = useSelector(getNoticeOfWork);
  const transformRowData = (stages: INoticeOfWorkApplicationStages[]) =>
    stages?.map((stage) => ({
      application_stage: stage.title,
      stage_status: stage.status,
      in_status_since: stage.inStatusSince,
    }));
  const columns: ColumnsType<any> = [
    {
      title: <b>Stage</b>,
      dataIndex: "application_stage",
      render: (text) => (
        <b className="light" title="Application Stage">
          {text}
        </b>
      ),
    },
    {
      title: <b>Status</b>,
      dataIndex: "stage_status",
      render: (text, record) => {
        return (
          <div title="Stage Status">
            <Badge status={getApplicationStageStatusType(text)} text={text} />
          </div>
        );
      },
    },
    {
      title: <b>In status since</b>,
      dataIndex: "in_status_since",
      render: (text, record) => <div title="In status since">{text}</div>,
    },
  ];

  return (
    <Table
      loading={!noticeOfWork.now_application_guid}
      size="small"
      pagination={false}
      columns={columns}
      rowKey="project_stage"
      dataSource={transformRowData(nowApplicationStages)}
      locale={{ emptyText: "This Application has no stage data." }}
    />
  );
};

export default NoticeOfWorkStagesTable;
