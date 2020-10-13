import React from "react";
import { Table, Divider, Descriptions } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { Link } from "react-router-dom";
import { Validate } from "@common/utils/Validate";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";

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
      title: "Party Guid",
      dataIndex: "party_guid",
      key: "party_guid",
      render: (text, record) => [
        <Descriptions
          column={{ sm: 1, md: 2 }}
          title={
            <Link to={router.PARTY_PROFILE.dynamicRoute(record.party_guid)}>
              <Highlight search={props.highlightRegex}>{record.name}</Highlight>
            </Link>
          }
        >
          <Descriptions.Item label="Roles">
            {props.partyRelationshipTypeHash.PMT &&
              record.mine_party_appt.map((pr) => (
                <p>
                  {props.partyRelationshipTypeHash[pr.mine_party_appt_type_code]}
                  <span className="padding-small--left" style={{ fontStyle: "italic" }}>
                    ({pr.mine.mine_name})
                  </span>
                </p>
              ))}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Highlight search={props.highlightRegex}>{record.email}</Highlight>
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            <Highlight search={props.highlightRegex}>{record.phone_no}</Highlight>
            {record.phone_ext}
          </Descriptions.Item>
        </Descriptions>,
      ],
    },
  ];
  return (
    <div>
      <h2>{props.header}</h2>
      <Divider style={{ padding: "0" }} />
      <Table
        className="nested-table padding-large--bottom"
        align="left"
        showHeader={false}
        pagination={false}
        columns={columns}
        dataSource={props.searchResults}
      />
      {props.showAdvancedLookup && (
        <Link
          className="padding-large--left float-right"
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
