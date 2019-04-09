import React from "react";
import { objectOf, string } from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { uniqBy, map, toArray } from "lodash";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class ContactList - paginated list of contacts
 */

const propTypes = {
  parties: objectOf(CustomPropTypes.party).isRequired,
  relationshipTypeHash: objectOf(string).isRequired,
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

const uniqueRolesString = (mine_party_appt, relationshipTypeHash) =>
  uniqBy(
    map(
      mine_party_appt,
      ({ mine_party_appt_type_code }) => relationshipTypeHash[mine_party_appt_type_code]
    )
  ).join(", ");

const transformRowData = (parties, relationshipTypeHash) =>
  toArray(parties).map((party) => ({
    key: party.party_guid,
    emptyField: Strings.EMPTY_FIELD,
    name: party.name || Strings.EMPTY_FIELD,
    email: party.email === "Unknown" ? Strings.EMPTY_FIELD : party.email,
    phone: party.phone_no && party.phone_no !== "Unknown" ? party.phone_no : Strings.EMPTY_FIELD,
    role:
      party.mine_party_appt.length > 0
        ? uniqueRolesString(party.mine_party_appt, relationshipTypeHash)
        : Strings.EMPTY_FIELD,
  }));

export const ContactList = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={columns}
    dataSource={transformRowData(props.parties, props.relationshipTypeHash)}
    locale={{ emptyText: <NullScreen type="no-results" /> }}
  />
);

ContactList.propTypes = propTypes;

export default ContactList;
