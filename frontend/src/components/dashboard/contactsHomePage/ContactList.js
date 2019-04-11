import React from "react";
import { objectOf, string, func } from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { uniqBy, map, toArray, isEmpty } from "lodash";
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
  handleSearch: func.isRequired,
  sortField: string,
  sortDir: string,
};

const defaultProps = {
  sortField: null,
  sortDir: null,
};

const columns = [
  {
    title: "Contact Name",
    dataIndex: "name",
    sortField: "name",
    render: (text, record) => (
      <Link to={router.PARTY_PROFILE.dynamicRoute(record.key)}>{text}</Link>
    ),
    sorter: true,
  },
  {
    title: "Role",
    dataIndex: "role",
    sortField: "mine_party_appt_type",
    render: (text) => <div title="role">{text}</div>,
    sorter: true,
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

const handleTableChange = (updateContactList) => (pagination, filters, sorter) => {
  const params = isEmpty(sorter)
    ? {
        sort_field: undefined,
        sort_dir: undefined,
      }
    : {
        sort_field: sorter.column.sortField,
        sort_dir: sorter.order.replace("end", ""),
      };
  updateContactList(params);
};

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: column.sortField === field ? dir.concat("end") : false,
  }));

export const ContactList = (props) => (
  <Table
    align="left"
    pagination={false}
    columns={applySortIndicator(columns, props.sortField, props.sortDir)}
    dataSource={transformRowData(props.parties, props.relationshipTypeHash)}
    locale={{ emptyText: <NullScreen type="no-results" /> }}
    onChange={handleTableChange(props.handleSearch)}
  />
);

ContactList.propTypes = propTypes;
ContactList.defaultProps = defaultProps;

export default ContactList;
