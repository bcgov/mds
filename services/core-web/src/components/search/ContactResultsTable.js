import React from "react";
import { Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { Link } from "react-router-dom";
import { Validate } from "@common/utils/Validate";
import * as Strings from "@mds/common/constants/strings";
import * as router from "@/constants/routes";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderHighlightedTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { nullableStringSorter } from "@common/utils/helpers";

/**
 * @class  ContactResultsTable - displays a table of mine search results
 */

const propTypes = {
  header: PropTypes.string.isRequired,
  highlightRegex: PropTypes.objectOf(PropTypes.regexp).isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  query: PropTypes.string.isRequired,
  partyRelationshipTypeHash: PropTypes.objectOf(PropTypes.strings).isRequired,
  showAdvancedLookup: PropTypes.bool.isRequired,
};

const defaultProps = {};

const parseQuery = (query) => {
  if (Validate.EMAIL_REGEX.test(query)) {
    return { email: query };
  }
  if (Validate.PHONE_REGEX.test(query)) {
    return { phone_no: query };
  }
  const terms = query.split(" ");
  if (terms.length === 1) {
    return { last_name: terms[0] };
  }
  return { first_name: terms[0], last_name: terms.slice(1).join(" ") };
};

export const ContactResultsTable = (props) => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        return (
          <Link to={router.PARTY_PROFILE.dynamicRoute(record.party_guid)}>
            <Highlight search={props.highlightRegex}>{text}</Highlight>
          </Link>
        );
      },
      sorter: nullableStringSorter("name"),
    },
    {
      title: "Roles",
      key: "roles",
      render: props.partyRelationshipTypeHash.PMT
        ? (record) => {
            return record.mine_party_appt.map((pr) => (
              <p key={"permit-record-" + pr.permit_no}>
                {props.partyRelationshipTypeHash[pr.mine_party_appt_type_code]}
                <span className="padding-sm--left" style={{ fontStyle: "italic" }}>
                  ({pr.mine_party_appt_type_code === "PMT" ? pr.permit_no : pr.mine.mine_name})
                </span>
              </p>
            ));
          }
        : null,
    },
    {
      title: "Phone",
      dataIndex: "phone_no",
      key: "phone_no",
      render: (text, record) => (
        <>
          <Highlight search={props.highlightRegex}>{text}</Highlight>
          {record.phone_ext}
        </>
      ),
    },
    renderHighlightedTextColumn("email", "Email", props.highlightRegex),
  ];
  return (
    <div className="padding-lg--bottom">
      <h2>{props.header}</h2>
      <Divider style={{ padding: "0" }} />
      <CoreTable columns={columns} dataSource={props.searchResults} />
      {props.showAdvancedLookup && (
        <Link
          className="padding-lg--left float-right"
          to={router.CONTACT_HOME_PAGE.dynamicRoute({
            ...parseQuery(props.query),
            page: Strings.DEFAULT_PAGE,
            per_page: Strings.DEFAULT_PER_PAGE,
          })}
        >
          Advanced lookup for Contacts
        </Link>
      )}
    </div>
  );
};

ContactResultsTable.propTypes = propTypes;
ContactResultsTable.defaultProps = defaultProps;

export default ContactResultsTable;
