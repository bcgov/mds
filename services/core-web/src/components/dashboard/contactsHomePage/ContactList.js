import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { uniqBy, map, toArray, isEmpty } from "lodash";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";
import { getTableHeaders } from "@/utils/helpers";

/**
 * @class ContactList - paginated list of contacts
 */

const propTypes = {
  parties: PropTypes.objectOf(CustomPropTypes.party).isRequired,
  relationshipTypeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  handleSearch: PropTypes.func.isRequired,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {
  sortField: null,
  sortDir: null,
};

const columns = [
  {
    title: "Contact Name",
    dataIndex: "name",
    sortField: "party_name",
    width: 150,
    render: ([firstName = "", lastName = ""], record) => {
      const comma = firstName ? ", " : "";
      return (
        <Link
          to={router.PARTY_PROFILE.dynamicRoute(record.key)}
        >{` ${lastName}${comma}${firstName}`}</Link>
      );
    },
    sorter: true,
  },
  {
    title: "Role",
    dataIndex: "role",
    width: 150,
    render: (text) => <div title="role">{text}</div>,
  },
  {
    title: "Email",
    dataIndex: "email",
    width: 150,
    render: (text) => <div title="email">{text}</div>,
  },
  {
    title: "Phone",
    dataIndex: "phone",
    width: 150,
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
    name: party.first_name
      ? [party.first_name, party.party_name]
      : ["", party.name || Strings.EMPTY_FIELD],
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
  <TableLoadingWrapper
    condition={props.isLoaded}
    tableHeaders={getTableHeaders(columns)}
    isPaginated
  >
    <Table
      rowClassName="fade-in"
      align="left"
      pagination={false}
      columns={applySortIndicator(columns, props.sortField, props.sortDir)}
      dataSource={transformRowData(props.parties, props.relationshipTypeHash)}
      locale={{
        emptyText: <NullScreen type="no-results" />,
      }}
      onChange={handleTableChange(props.handleSearch)}
    />
  </TableLoadingWrapper>
);

ContactList.propTypes = propTypes;
ContactList.defaultProps = defaultProps;

export default ContactList;
