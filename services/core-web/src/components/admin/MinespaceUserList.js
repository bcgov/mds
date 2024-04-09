import React from "react";
import { Button, Popconfirm } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@mds/common/constants/strings";
import { TRASHCAN, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";

const propTypes = {
  minespaceUsers: PropTypes.arrayOf(CustomPropTypes.minespaceUser),
  minespaceUserMines: PropTypes.arrayOf(CustomPropTypes.mineName),
  handleDelete: PropTypes.func,
  isLoaded: PropTypes.bool.isRequired,
  handleOpenModal: PropTypes.func.isRequired,
};

const defaultProps = {
  minespaceUsers: [],
  minespaceUserMines: [],
  handleDelete: () => {},
};

const columns = [
  renderTextColumn("email_or_username", "Email/BCeID", true),
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
  {
    title: "",
    dataIndex: "delete",
    width: 175,
    render: (text, record) => (
      <div title="">
        <Button
          className="full-mobile"
          onClick={(e) => record.update(e, record)}
          ghost
          type="primary"
        >
          <img name="edit" src={EDIT_OUTLINE_VIOLET} alt="Edit User" />
        </Button>
        <Popconfirm
          placement="topLeft"
          title={`Are you sure you want to delete ${record.email_or_username}?`}
          onConfirm={() => text(record.user_id)}
          okText="Delete"
          cancelText="Cancel"
        >
          <Button className="full-mobile" ghost type="primary">
            <img name="remove" src={TRASHCAN} alt="Remove User" />
          </Button>
        </Popconfirm>
      </div>
    ),
  },
];

const lookupMineName = (mine_guids, mines) =>
  mine_guids.map((mine_guid) => {
    const mine_record = mines.find((mine) => mine.mine_guid === mine_guid);
    return {
      mine_guid,
      mine_name: mine_record ? `${mine_record.mine_name}-${mine_record.mine_no}` : "",
    };
  });

const transformRowData = (minespaceUsers, mines, deleteFunc, handleOpenModal) =>
  minespaceUsers.map((user) => ({
    key: user.user_id,
    emptyField: Strings.EMPTY_FIELD,
    email_or_username: user.email_or_username,
    mineNames: lookupMineName(user.mines, mines),
    user_id: user.user_id,
    delete: deleteFunc,
    update: handleOpenModal,
  }));

export const MinespaceUserList = (props) => (
  <CoreTable
    condition={props.isLoaded}
    columns={columns}
    dataSource={transformRowData(
      props.minespaceUsers,
      props.minespaceUserMines,
      props.handleDelete,
      props.handleOpenModal
    )}
  />
);
MinespaceUserList.propTypes = propTypes;
MinespaceUserList.defaultProps = defaultProps;

export default MinespaceUserList;
