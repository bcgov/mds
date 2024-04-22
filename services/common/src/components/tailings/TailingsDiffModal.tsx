import { Button, Modal, Table, Typography } from "antd";
import React, { FC, useEffect, useState } from "react";
import { isEqual } from "lodash";
import { IExplosivesPermit } from "@mds/common/interfaces/permits/explosivesPermit.interface";
import DiffColumn, { IDiffColumn } from "../history/DiffColumn";
import { ITailingsStorageFacility } from "@mds/common/interfaces/tailingsStorageFacility";

interface ITailingsDiffModal {
  tsf: ITailingsStorageFacility;
  open: boolean;
  onCancel: () => void;
}

interface IPermitDifferencesByAmendment {
  [amendmentId: string]: IDiffColumn[];
}

const TailingsDiffModal: FC<ITailingsDiffModal> = ({ tsf, open = false, onCancel }) => {
  const differences = [];

  const columns = [
    {
      title: "Section",
      dataIndex: "now_number",
      key: "now_number",
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
    },
    {
      title: "Changes",
      dataIndex: "differences",
      key: "differences",
      render: (differences: IDiffColumn[]) => <DiffColumn differences={differences} />,
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
        You are viewing the past history of tailings storage facility for this mine.
      </Typography.Paragraph>
      <Table
        className="diff-table"
        rowClassName="diff-table-row"
        pagination={false}
        columns={columns}
        dataSource={differences}
        rowKey="explosives_permit_amendment_id"
      />
    </Modal>
  );
};

export default TailingsDiffModal;
