import React, { Component } from "react";
import { Row, Col } from "antd";
import NoticeOfWorkSearchForm from "@/components/Forms/noticeOfWork/NoticeOfWorkSearchForm";

/**
 * @class NoticeOfWorkSearch supports searching for a filtered list of notice of Work applications.
 */

//  this will be stateful when implemented
// eslint-disable-next-line react/prefer-stateless-function
export class NoticeOfWorkSearch extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <span className="advanced-search__container">
              <NoticeOfWorkSearchForm />
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}

export default NoticeOfWorkSearch;
