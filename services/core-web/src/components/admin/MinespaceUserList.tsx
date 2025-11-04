import React, { FC } from "react";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderTextColumn, renderDateColumn, renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { IMineName, IMinespaceUser } from "@mds/common/interfaces";
import { deleteConfirmWrapper } from "@mds/common/components/common/ActionMenu";

interface MinespaceUserListProps {
  minespaceUsers: IMinespaceUser[];
  minespaceUserMines: IMineName[];
  handleDelete: (userId) => void | Promise<void>;
  isLoaded: boolean;
  handleOpenModal: (event, record) => void | Promise<void>;
}

export const MinespaceUserList: FC<MinespaceUserListProps> = ({
  minespaceUsers = [],
  minespaceUserMines = [],
  handleDelete = () => { },
  isLoaded,
  handleOpenModal
}) => {

  const lookupMineName = (mine_guids, mines) =>
    mine_guids.map((mine_guid) => {
      const mine_record = mines.find((mine) => mine.mine_guid === mine_guid);
      return {
        mine_guid,
        mine_name: mine_record ? `${mine_record.mine_name}-${mine_record.mine_no}` : "",
      };
    }).sort((a, b) => a.mine_name.localeCompare(b.mine_name));

  const getRowData = () =>
    minespaceUsers.map((user) => ({
      key: user.user_id,
      ...user,
      mineNames: lookupMineName(user.mines, minespaceUserMines),
    }));

  const columns = [
    renderTextColumn("display_name", "Name", true),
    renderTextColumn("bceid_username", "BCeID", true),
    renderTextColumn("email", "Email", true),
    renderDateColumn("last_logged_in", "Last Login", true),
    {
      title: "Mines",
      dataIndex: "mineNames",
      render: (text) => (
        <div title="Mines">
          {text &&
            text.map(({ mine_guid, mine_name }) => (
              <span key={mine_guid}>
                {mine_name}
                <br />
              </span>
            ))}
        </div>
      ),
    },
    renderActionsColumn({
      actions: [
        {
          key: "edit",
          label: "Edit User",
          clickFunction: (e, record) => { handleOpenModal(e, record) }
        },
        {
          key: "delete",
          label: "Delete",
          clickFunction: (_, record) => {
            deleteConfirmWrapper(`MineSpace user: ${record.bceid_username}`,
              () => handleDelete(record.user_id)
            )
          }
        }
      ],
    })
  ];

  return (
    <CoreTable
      condition={isLoaded}
      columns={columns}
      dataSource={getRowData()}
    />
  )
};

export default MinespaceUserList;