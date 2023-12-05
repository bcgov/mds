import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { uniqBy, map, toArray, isEmpty } from "lodash";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { SUCCESS_CHECKMARK } from "@/constants/assets";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";

/**
 * @class ContactList - paginated list of contacts
 */

const propTypes = {
  parties: PropTypes.objectOf(CustomPropTypes.party).isRequired,
  relationshipTypeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  handleSearch: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
};

const defaultProps = {
  sortField: null,
  sortDir: null,
};

const columns = [
  {
    title: "Name",
    key: "name",
    dataIndex: "name",
    sortField: "party_name",
    width: 150,
    sorter: true,
    render: ([firstName = "", lastName = ""], record) => {
      const comma = firstName ? ", " : "";
      return (
        <Link title="Name" to={router.PARTY_PROFILE.dynamicRoute(record.key)}>
          {`${lastName}${comma}${firstName}`}
          {!isEmpty(record.party_orgbook_entity) && (
            <img
              alt="Verified"
              className="padding-sm"
              src={SUCCESS_CHECKMARK}
              width="25"
              title={`Party verified by ${
                record.party_orgbook_entity.association_user
              } on ${formatDate(record.party_orgbook_entity.association_timestamp)}`}
            />
          )}
        </Link>
      );
    },
  },
  renderTextColumn("role", "Role", false, "", 150),
  renderTextColumn("email", "Email", false, "", 150),
  renderTextColumn("phone", "Phone", false, "", 150),
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
    party_orgbook_entity: party.party_orgbook_entity,
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
  <CoreTable
    condition={props.isLoaded}
    columns={applySortIndicator(columns, props.sortField, props.sortDir)}
    dataSource={transformRowData(props.parties, props.relationshipTypeHash)}
    onChange={handleTableChange(props.handleSearch)}
  />
);

ContactList.propTypes = propTypes;
ContactList.defaultProps = defaultProps;

export default ContactList;
