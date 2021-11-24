import React from "react";
import { Button } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import { TRASHCAN } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {};

const columns = [
  {
    title: "Email/BCeID",
    dataIndex: "email_or_username",
    render: (text) => <div title="Email/BCeID">{text}</div>,
  },
  {
    title: "",
    dataIndex: "delete",
    render: (text, record) => (
      <div title="">
        <Button className="full-mobile" ghost type="primary" onClick={console.log("RECORD")}>
          <img name="remove" src={TRASHCAN} alt="Remove User" />
        </Button>
      </div>
    ),
  },
];

const transformRowData = (contacts) =>
  contacts.map((contact, i) => ({
    key: i,
    ...contact,
  }));

export const EMLIContactsTable = (props) => (
  <CoreTable
    condition={props.isLoaded}
    columns={columns}
    dataSource={transformRowData([])}
    tableProps={{
      align: "center",
      pagination: false,
    }}
  />
);
EMLIContactsTable.propTypes = propTypes;
EMLIContactsTable.defaultProps = defaultProps;

export default EMLIContactsTable;
