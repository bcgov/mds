import React from "react";
import { Button, Popconfirm } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import { TRASHCAN } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  minespaceUsers: PropTypes.arrayOf(CustomPropTypes.minespaceUser),
  minespaceUserMines: PropTypes.arrayOf(CustomPropTypes.mineName),
  handleDelete: PropTypes.func,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {
  minespaceUsers: [],
  minespaceUserMines: [],
  handleDelete: () => {},
};

const columns = [
  {
    title: "Email",
    width: 150,
    dataIndex: "email",
    render: (text) => <div title="Email">{text}</div>,
  },
  {
    title: "Mines",
    width: 150,
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
    width: 150,
    dataIndex: "delete",
    render: (text, record) => (
      <div title="">
        <Popconfirm
          placement="topLeft"
          title={`Are you sure you want to delete ${record.email}?`}
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

const transformRowData = (minespaceUsers, mines, deleteFunc) =>
  minespaceUsers.map((user) => ({
    key: user.user_id,
    emptyField: Strings.EMPTY_FIELD,
    email: user.email,
    mineNames: lookupMineName(user.mines, mines),
    user_id: user.user_id,
    delete: deleteFunc,
  }));

export const MinespaceUserList = (props) => (
  <CoreTable
    condition={props.isLoaded}
    columns={columns}
    dataSource={transformRowData(
      props.minespaceUsers,
      props.minespaceUserMines,
      props.handleDelete
    )}
    tableProps={{
      align: "center",
      pagination: false,
      locale: { emptyText: <NullScreen type="no-results" /> },
    }}
  />
);
MinespaceUserList.propTypes = propTypes;
MinespaceUserList.defaultProps = defaultProps;

export default MinespaceUserList;
