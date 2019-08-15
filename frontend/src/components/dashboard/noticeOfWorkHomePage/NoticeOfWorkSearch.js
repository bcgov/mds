import React, { Component } from "react";
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

//  this will be stateful when implemented
// eslint-disable-next-line react/prefer-stateless-function
export class NoticeOfWorkSearch extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <span className="advanced-search__container">
              <NoticeOfWorkSearchForm
                onSubmit={this.props.handleSearch}
                initialValues={this.props.initialValues}
              />
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}

NoticeOfWorkSearch.propTypes = propTypes;

export default NoticeOfWorkSearch;
