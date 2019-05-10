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
  partyRelationshipTypeHash: PropTypes.objectOf(PropTypes.strings).isRequired,
};

const defaultProps = {};

export const ContactResultsTable = (props) => {
  const columns = [
    {
      title: "Party Guid",
      dataIndex: "party_guid",
      key: "party_guid",
      render: (text, record) => [
        <Row>
          <Col span={24}>
            <Link to={router.PARTY_PROFILE.dynamicRoute(record.party_guid)}>
              <p style={{ fontSize: "22px", color: "inherit" }}>
                <Highlight search={props.highlightRegex}>{record.name}</Highlight>
              </p>
            </Link>
          </Col>
        </Row>,
        <Row style={{ paddingTop: "5px" }}>
          <Col span={3}>Roles</Col>
          <Col span={9}>
            {props.partyRelationshipTypeHash.PMT &&
              record.mine_party_appt.map((pr) => [
                <span>{props.partyRelationshipTypeHash[pr.mine_party_appt_type_code]}</span>,
                <br />,
              ])}
          </Col>
          <Col span={3}>Email</Col>
          <Col span={9}>
            <Highlight search={props.highlightRegex}>{record.email}</Highlight>
          </Col>
          <Col span={3}>Mine</Col>
          <Col span={9}>
            <Highlight search={props.highlightRegex}>
              {record.mine_party_appt[0].mine.mine_name}
            </Highlight>
          </Col>
          <Col span={3}>Phone</Col>
          <Col>
            <Highlight search={props.highlightRegex}>{record.phone_no}</Highlight>
            {record.phone_ext && record.phone_ext}
          </Col>
        </Row>,
      ],
    },
  ];
  return (
    <Col md={12} sm={24} style={{ padding: "30px", paddingBottom: "60px" }}>
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
    </Col>
  );
};

ContactResultsTable.propTypes = propTypes;
ContactResultsTable.defaultProps = defaultProps;

export default ContactResultsTable;
