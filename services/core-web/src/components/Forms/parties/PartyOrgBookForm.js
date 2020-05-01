import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Input } from "antd";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isSearchingOrgBook: PropTypes.bool.isRequired,
};

const { Search } = Input;

export const PartyOrgBookForm = (props) => (
  <Row gutter={48}>
    <Col md={12} sm={24}>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <h5>OrgBook BC Entity</h5>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col>
          <Search
            style={{ margin: 0 }}
            placeholder="Enter keywords to help identify this party"
            onSearch={(value) => props.handleSubmit(value)}
            loading={props.isSearchingOrgBook}
          />
        </Col>
      </Row>
    </Col>
    <Col md={12} sm={24} />
  </Row>
);

PartyOrgBookForm.propTypes = propTypes;

export default PartyOrgBookForm;
