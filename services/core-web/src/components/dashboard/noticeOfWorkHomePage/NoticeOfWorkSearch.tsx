import React from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import NoticeOfWorkSearchForm from "@/components/Forms/noticeOfWork/NoticeOfWorkSearchForm";

/**
 * NoticeOfWorkSearch supports searching for a filtered list of notice of Work applications.
 */

const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  searchParams: PropTypes.objectOf(PropTypes.any).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const NoticeOfWorkSearch = (props) => {
  const handleSubmit = (handleSearch) => (values) => {
    const params = {
      ...props.searchParams,
      ...values,
    };

    if (isEmpty(values)) {
      Object.keys(props.initialValues).map((key) => delete params[key]);
    }

    handleSearch(params);
  };

  return (
    <div>
      <Row>
        <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
          <span className="advanced-search__container">
            <NoticeOfWorkSearchForm
              onSubmit={handleSubmit(props.handleSearch)}
              initialValues={props.initialValues}
            />
          </span>
        </Col>
      </Row>
    </div>
  );
};

NoticeOfWorkSearch.propTypes = propTypes;

export default NoticeOfWorkSearch;
