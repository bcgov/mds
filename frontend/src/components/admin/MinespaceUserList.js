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

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  minespaceUsers: PropTypes.object.isRequired,
  mines: PropTypes.object.isRequired,
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
    // render: (text,record) => (
    //   <div>
    //   {text &&
    //   uniqBy(text, "mine_name").map(({mine_guid}) => (
    //     <div key={mine_guid}>{mine_name}</div>
    //   ))}
    //   {!text && <div>{record.emptyField}</div>}
    //   </div>
    // )
  },
];

const transformRowData = (minespaceUsers) =>
  minespaceUsers.map((user) => ({
    key: user.id,
    emptyField: Strings.EMPTY_FIELD,
    email: user.email,
    mineNames: user.mine_guids ? user.mine_guids : Strings.EMPTY_FIELD,
  }));

export const MinespaceUserList = (props) => (
  <Table
    align="center"
    pagination={false}
    columns={columns}
    dataSource={transformRowData(props.minespaceUsers)}
    scroll={{ x: 1500 }}
    locale={{ emptyText: <NullScreen type="no-results" /> }}
  />
);
MinespaceUserList.propTypes = propTypes;

export default MinespaceUserList;
