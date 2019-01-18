import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Table } from "antd";
import AddMinespaceUser from "@/components/Forms/AddMinespaceUser";
import { createDropDownList } from "@/utils/helpers";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import { uniqBy } from "lodash";
import { min } from "moment";

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  minespaceUsers: PropTypes.array.isRequired,
  mines: PropTypes.array.isRequired,
};

const defaultProps = {
  mines: {},
};

const columns = [
  {
    title: "User Email",
    width: 400,
    dataIndex: "email",
  },
  {
    title: "Mines",
    width: 300,
    dataIndex: "mineNames",
    render: (text) => (
      <div>{text && text.map(({ guid, mine_name }) => <div key={guid}>{mine_name}</div>)}</div>
    ),
  },
];

const lookupMineName = (mine_guids, mines) =>
  mine_guids.map((guid) => {
    const mine_record = mines.find((mine) => mine.guid === guid);
    return { guid, mine_name: mine_record ? mine_record.mine_name : "" };
  });

const transformRowData = (minespaceUsers, mines) =>
  minespaceUsers.map((user) => ({
    key: user.id,
    emptyField: Strings.EMPTY_FIELD,
    email: user.email,
    mineNames: lookupMineName(user.mines, mines),
  }));

export const MinespaceUserList = (props) => (
  <div>
    {props.mines && (
      <Table
        align="center"
        pagination={false}
        columns={columns}
        dataSource={transformRowData(props.minespaceUsers, props.mines)}
        scroll={{ x: 1500 }}
        locale={{ emptyText: <NullScreen type="no-results" /> }}
      />
    )}
  </div>
);
MinespaceUserList.propTypes = propTypes;

export default MinespaceUserList;
