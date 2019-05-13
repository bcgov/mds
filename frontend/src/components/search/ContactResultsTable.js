import React from "react";
import { Table, Row, Col, Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";

import { Link } from "react-router-dom";
import * as router from "@/constants/routes";

/**
 * @class  ContactResultsTable - displays a table of mine search results
 */

const propTypes = {
  header: PropTypes.string.isRequired,
  highlightRegex: PropTypes.string.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  query: PropTypes.string.isRequired,
  partyRelationshipTypeHash: PropTypes.objectOf(PropTypes.strings).isRequired,
};

const defaultProps = {};

const parseQuery = (query) => {
  const exp = RegExp("@");
  if (exp.test(query)) {
    return { email: query };
  }
  const terms = query.split(" ");
  if (terms.length === 1) {
    return { last_name: terms[0] };
  }
  return { first_name: terms[0], last_name: terms[1] };
};

export const ContactResultsTable = (props) => {
  const columns = [
    {
      title: "Party Guid",
      dataIndex: "party_guid",
      key: "party_guid",
      render: (text, record) => [
        <Row>
          <Col span={24}>
            <Link
              to={router.PARTY_PROFILE.dynamicRoute(record.party_guid)}
              style={{ fontSize: "1.5rem", fontWeight: "bold" }}
            >
              <Highlight search={props.highlightRegex}>{record.name}</Highlight>
            </Link>
          </Col>
        </Row>,
        <Row style={{ paddingTop: "5px" }}>
          <Col xs={24} md={4}>
            <p>Roles</p>
          </Col>
          <Col xs={24} md={8}>
            <p>
              {props.partyRelationshipTypeHash.PMT &&
                record.mine_party_appt.map((pr) => [
                  <span>{props.partyRelationshipTypeHash[pr.mine_party_appt_type_code]}</span>,
                  <br />,
                ])}
            </p>
          </Col>
          <Col xs={24} md={4}>
            <p>Email</p>
          </Col>
          <Col xs={24} md={8}>
            <p>
              <Highlight search={props.highlightRegex}>{record.email}</Highlight>
            </p>
          </Col>
          <Col xs={24} md={4}>
            <p>Mine</p>
          </Col>
          <Col xs={24} md={8}>
            <p>
              <Highlight search={props.highlightRegex}>
                {record.mine_party_appt[0].mine.mine_name}
              </Highlight>
            </p>
          </Col>
          <Col xs={24} md={4}>
            <p>Phone</p>
          </Col>
          <Col xs={24} md={8}>
            <p>
              <Highlight search={props.highlightRegex}>{record.phone_no}</Highlight>
              {record.phone_ext && record.phone_ext}
            </p>
          </Col>
        </Row>,
      ],
    },
  ];
  return (
    <div>
      <h2>{props.header}</h2>
      <Divider />
      <Table
        className="nested-table"
        align="left"
        showHeader={false}
        pagination={false}
        columns={columns}
        dataSource={props.searchResults}
      />
      <Link to={router.CONTACT_HOME_PAGE.dynamicRoute(parseQuery(props.query))}>
        <p style={{ fontSize: "22px", color: "inherit", float: "right" }}>
          See all results in Contacts ({props.searchResults.length})
        </p>
      </Link>
    </div>
  );
};

ContactResultsTable.propTypes = propTypes;
ContactResultsTable.defaultProps = defaultProps;

export default ContactResultsTable;
