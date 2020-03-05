/* eslint-disable */
import React from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
// import ReportsSearchForm from "@/components/Forms/reports/ReportsSearchForm";

const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const ReportsSearch = (props) => (
  <div>
    <Row>
      <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
        <span className="advanced-search__container">
          {/* <ReportsSearchForm
            onSubmit={props.handleSearch}
            initialValues={props.initialValues}
          /> */}
        </span>
      </Col>
    </Row>
  </div>
);

ReportsSearch.propTypes = propTypes;

export default ReportsSearch;
