import React, { Component } from "react";
import { Button, Collapse, Icon } from "antd";
import NOWGeneralInfo from "@/components/noticeOfWork/NOWGeneralInfo";
import NOWWorkPlan from "@/components/noticeOfWork/NOWWorkPlan";
/**
 * @class NoticeOfWorkApplication - contains all information regarding to a notice of work application
 */

const { Panel } = Collapse;

// eslint-disable-next-line react/prefer-stateless-function
export class NoticeOfWorkApplication extends Component {
  render() {
    return (
      <div className="page__content">
        <div className="inline-flex between">
          <div>
            <h1>NoW Number: </h1>
            <p>
              The information below is a subset of all available data. Open the PDF for a
              comprehensive view.
            </p>
          </div>
          <Button type="primary">View PDF</Button>
        </div>
        <br />
        <Collapse
          defaultActiveKey={["1", "2"]}
          expandIconPosition="right"
          expandIcon={({ isActive }) =>
            isActive ? <Icon type="minus-square" /> : <Icon type="plus-square" />
          }
        >
          <Panel header={<h2>General Information</h2>} key="1">
            <NOWGeneralInfo />
          </Panel>
          <Panel header={<h2>Work Plan</h2>} key="2">
            <NOWWorkPlan />
          </Panel>
        </Collapse>
      </div>
    );
  }
}

export default NoticeOfWorkApplication;
