import React from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import ReportSearchForm from "@/components/Forms/reports/ReportSearchForm";

const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const ReportsSearch = (props) => (
  <div>
    <Row>
      <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
        <span className="advanced-search__container">
          <ReportSearchForm
            onSubmit={props.handleSearch}
            handleReset={props.handleReset}
            initialValues={props.initialValues}
          />
        </span>
      </Col>
    </Row>
  </div>
);

ReportsSearch.propTypes = propTypes;

export default ReportsSearch;
