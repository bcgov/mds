import React from "react";
import { objectOf, arrayOf, string } from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "antd";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class ContactList - paginated list of contacts
 */

const propTypes = {
  parties: objectOf(CustomPropTypes.party).isRequired,
  partyIds: arrayOf(string).isRequired,
};

const columns = [
  {
    title: "Contact Name",
    dataIndex: "name",
    render: (text, record) => (
      <Link to={router.PARTY_PROFILE.dynamicRoute(record.key)}>{text}</Link>
    ),
  },
  {
    title: "Role",
    dataIndex: "role",
    render: (text) => <div title="role">{text}</div>,
  },
  {
    title: "Email",
    dataIndex: "email",
    render: (text) => <div title="email">{text}</div>,
  },
  {
    title: "Phone",
    dataIndex: "phone",
    render: (text) => <div title="phone">{text}</div>,
  },
];

const transformRowData = (parties, partyIds) =>
  partyIds.map((id) => ({
    key: id,
    emptyField: Strings.EMPTY_FIELD,
    name: parties[id].name ? parties[id].name : Strings.EMPTY_FIELD,
    email: parties[id].email === "Unknown" ? Strings.EMPTY_FIELD : parties[id].email,
    phone:
      parties[id].phone_no && parties[id].phone_no !== "Unknown"
        ? parties[id].phone_no
        : Strings.EMPTY_FIELD,
    role: Strings.EMPTY_FIELD,
  }));

export const ContactList = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={columns}
    dataSource={transformRowData(props.parties, props.partyIds)}
    locale={{ emptyText: <NullScreen type="no-results" /> }}
  />
);

ContactList.propTypes = propTypes;

export default ContactList;
