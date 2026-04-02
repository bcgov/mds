import React, { FC, useEffect, useState } from "react";
import { Button, Table } from "antd";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { fetchNoticeOfWorkApplicationTierHistory } from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { formatDateTime } from "@mds/common/redux/utils/helpers";
import { getNoticeOfWorkTierOptionsHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as Strings from "@mds/common/constants/strings";

interface NOWTierHistoryModalProps {
  closeModal: () => void;
  applicationGuid: string;
}

export const NOWTierHistoryModal: FC<NOWTierHistoryModalProps> = (props) => {
  const dispatch = useAppDispatch();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const tierOptionsHash = useAppSelector(getNoticeOfWorkTierOptionsHash);

  useEffect(() => {
    dispatch(fetchNoticeOfWorkApplicationTierHistory(props.applicationGuid))
      .then((response) => {
        setHistory(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props.applicationGuid, dispatch]);

  const columns = [
    {
      title: "Modified By",
      dataIndex: "updated_by",
      key: "updated_by",
    },
    {
      title: "Date",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (text) => formatDateTime(text),
    },
    {
      title: "Change",
      dataIndex: "changeset",
      key: "changeset",
      render: (changeset) => {
        const tierChange = changeset.find((c) => c.field_name === "notice_of_work_tier_code");
        if (tierChange) {
           const from = tierOptionsHash[tierChange.from] || Strings.EMPTY_FIELD;
           const to = tierOptionsHash[tierChange.to] || Strings.EMPTY_FIELD;
           const suffix = !tierChange.from ? " (initial intake)" : "";
           return `Changed from ${from} to ${to}${suffix}`;
        }
        return "No tier change recorded";
      },
    },
  ];

  return (
    <>
      <Table
        loading={loading}
        dataSource={history}
        columns={columns}
        pagination={false}
        locale={{ emptyText: "No history found for this application." }}
      />
      <div className="right center-mobile mt-2">
        <Button onClick={props.closeModal}>Close</Button>
      </div>
    </>
  );
};

export default NOWTierHistoryModal;
