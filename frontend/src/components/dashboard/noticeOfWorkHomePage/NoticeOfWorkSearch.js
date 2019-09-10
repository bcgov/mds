import React from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import NoticeOfWorkSearchForm from "@/components/Forms/noticeOfWork/NoticeOfWorkSearchForm";

/**
 * @class NoticeOfWorkSearch supports searching for a filtered list of notice of Work applications.
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const NoticeOfWorkSearch = (props) => (
  <div>
    <Row>
      <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
        <span className="advanced-search__container">
          <NoticeOfWorkSearchForm
            onSubmit={props.handleSearch}
            initialValues={props.initialValues}
          />
        </span>
      </Col>
    </Row>
  </div>
);

NoticeOfWorkSearch.propTypes = propTypes;

export default NoticeOfWorkSearch;
