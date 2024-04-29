import { Button, Modal, Table, Typography } from "antd";
import React, { FC } from "react";
import DiffColumn from "../history/DiffColumn";
import { DiffColumnValueMapper, IDiffColumn, IDiffEntry } from "../history/DiffColumn.interface";
import { formatDate } from "@mds/common/redux/utils/helpers";

interface ITailingsDiffModal {
  mineName: string;
  tsfName: string;
  history: IDiffEntry[];
  open: boolean;
  valueMapper: DiffColumnValueMapper;
  onCancel: () => void;
}

const TailingsDiffModal: FC<ITailingsDiffModal> = ({
  mineName,
  tsfName,
  history,
  open = false,
  onCancel,
  valueMapper,
}) => {
  const columns = [
    {
      title: "Section",
      key: "section",
      render: () => <Typography.Text>Basic Information</Typography.Text>,
    },
    {
      title: "Updated by",
      key: "updated_by",
      dataIndex: "updated_by",
    },
    {
      title: "Date",
      key: "updated_at",
      dataIndex: "updated_at",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Changes",
      dataIndex: "changeset",
      key: "changeset",
      render: (differences: IDiffColumn[]) => (
        <DiffColumn differences={differences} valueMapper={valueMapper} />
      ),
    },
  ];

  return (
    <Modal
      title="Tailings Storage Facility History"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Close
        </Button>,
      ]}
      width={1000}
    >
      <Typography.Title level={3}>View History</Typography.Title>
      <Typography.Paragraph>
        You are viewing the past history of {tsfName} for this mine <b>({mineName})</b>
      </Typography.Paragraph>
      <Table
        className="diff-table"
        rowClassName="diff-table-row"
        pagination={false}
        columns={columns}
        dataSource={history}
        rowKey="explosives_permit_amendment_id"
      />
    </Modal>
  );
};

export default TailingsDiffModal;
